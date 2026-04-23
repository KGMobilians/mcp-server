---
name: mobilpay-integration
description: >
  MOBILPAY(KG파이낸셜) REST API 결제 연동 전문가 스킬. 결제 연동 코드 작성, 결제 플로우 구현, API 호출 코드 생성, 보안 검증(HMAC, skey) 구현, noti_url 핸들러 작성, 에러 처리 등 MOBILPAY 결제 시스템 연동의 모든 단계를 가이드합니다.
  이 스킬은 사용자가 MOBILPAY, KG파이낸셜, 모빌페이, KG파이낸셜, mobilians 등을 언급하거나,
  한국 PG사 결제 연동, 휴대폰결제/신용카드/계좌이체/가상계좌 결제 구현, 결제창 호출, 거래등록 API,
  결제 승인/취소/환불 구현, HMAC 검증, noti_url 처리, 결제 에러코드 조회 등을 요청할 때 반드시 사용해야 합니다.
  결제 연동 코드 리뷰나 보안 점검을 요청할 때도 이 스킬을 사용하세요.
---

# MOBILPAY 결제 연동 스킬

MOBILPAY(KG파이낸셜) REST API 결제 연동을 위한 전문가 스킬입니다. 이 스킬을 통해 정확한 API 명세에 기반한 코드를 생성하고, 보안 규칙을 자동으로 적용할 수 있습니다.

## 스킬을 사용하는 이유

MOBILPAY 결제 연동은 거래등록 → 결제창 → 인증/승인 → 후처리까지 여러 단계로 구성되어 있고, 각 단계마다 정확한 파라미터와 보안 규칙을 준수해야 합니다. AI가 일반 지식만으로 코드를 생성하면 파라미터명이 틀리거나, 보안 규칙을 누락하거나, 결제수단별 옵션을 잘못 적용하는 실수가 발생합니다. 이 스킬은 공식 API 명세를 references에 포함하고 있으므로, 이를 참조하여 정확한 코드를 생성할 수 있습니다.

## 작업 시작 전 확인사항

1. 사용자가 어떤 **결제수단**을 연동하려는지 파악 (휴대폰/신용카드/계좌이체/가상계좌/간편결제)
2. **일반결제**(인증+승인 일체형)인지 **하이브리드결제**(인증/승인 분리형)인지 파악
3. 사용자의 **프로그래밍 언어와 프레임워크** 확인
4. **테스트 환경**인지 **운영 환경**인지 확인

## 결제 플로우 개요

### 일반결제 (hybrid_pay=N, 기본값)

거래등록 → 결제창 호출 → 사용자 결제 → ok_url로 승인결과 수신 → 검증 → 서비스 제공

3단계만 구현하면 되므로 빠르고 간단합니다. 단순 결제에 적합합니다.

### 하이브리드결제 (hybrid_pay=Y)

거래등록 → 결제창 호출 → 사용자 인증 → ok_url로 인증결과 수신 → 가맹점이 승인 API 호출 → 승인결과 수신 → 서비스 제공

승인 시점을 가맹점이 제어할 수 있어 복합결제, 장바구니 결제에 적합합니다.

상세 플로우 다이어그램이 필요하면 `references/guides/flow-normal.md` 또는 `references/guides/flow-hybrid.md`를 참조하세요.

## 핵심 API 엔드포인트

| 단계 | API | Method | Path |
|------|-----|--------|------|
| 거래등록 | Registration | POST | `/MUP/api/registration` |
| 결제승인 | Approval | POST | `/MUP/api/approval` |
| 수동매입 | Purchase | POST | `/MUP/api/purchase` |
| 결제취소 | Cancellation | POST | `/MUP/api/cancellation` (cancel_type=C) |
| 환불 | Refund | POST | `/MUP/api/cancellation` (cancel_type=R) |
| 가상계좌 채번취소 | Account Expire | POST | `/MUP/api/account-expire` |
| 현금영수증 | Cash Receipt | POST | `/MUP/api/cash-receipt` |
| 에스크로 배송등록 | Escrow Delivery | POST | `/MUP/api/escrow/delivery` |

호스트:
- 테스트: `https://test.mobilians.co.kr`
- 운영: `https://mup.mobilians.co.kr`

공통 규약: Content-Type `application/json`, HTTPS(443), POST, 성공코드 `0000`

## 보안 규칙 (반드시 준수)

코드를 생성할 때 다음 규칙은 절대 위반하면 안 됩니다. 결제 보안에 직결되는 사항이므로, 모든 코드에서 자동으로 적용해야 합니다.

### 1. skey(서비스 키) 보호
`skey`는 HMAC 검증에 사용되는 비밀키입니다. 절대 클라이언트(프론트엔드, 브라우저) 코드에 하드코딩하거나 노출하지 마세요. 반드시 환경변수(`process.env.MOBILPAY_SKEY`)나 서버 설정 파일에서 로드해야 합니다.

```javascript
// ✅ 올바른 방법
const SKEY = process.env.MOBILPAY_SKEY;

// ❌ 절대 금지
const SKEY = "abc123secretkey"; // 하드코딩
```

### 2. HMAC 무결성 검증은 서버사이드 전용
HMAC-SHA256 검증 로직은 반드시 백엔드 서버에서만 수행합니다. 클라이언트에서 HMAC을 계산하면 skey가 노출됩니다.

HMAC 메시지 구성은 엔드포인트별로 다릅니다. 정확한 순서·필드를 써야 검증이 통과합니다.

| 엔드포인트 | message 구성 |
|-----------|-------------|
| 거래등록 / 결제 인증 / 결제 승인 | `amount(total)` + `ok_url` + `trade_id` + `time_stamp` |
| 결제 취소 / 환불 (`/cancellation`) | `sid` + `trade_id` + `pay_token` + `amount` |
| 에스크로 배송등록 (`/escrow/delivery`) | `sid` + `pay_token` + `amount` + `sign_date` |

알고리즘: `Base64(HMAC-SHA256(skey, message))`

```javascript
const crypto = require('crypto');
// 거래등록 예시
const registrationMessage = amount + ok_url + trade_id + time_stamp;
const hmac = crypto.createHmac('sha256', SKEY)
  .update(registrationMessage, 'utf8')
  .digest('base64');
```

각 언어별 HMAC 구현 예제(거래등록/취소/에스크로 모두)가 필요하면 `references/api/hmac.md`를 참조하세요. Java, C#, Node.js, Python, PHP 예제가 포함되어 있습니다.

### 3. noti_url 핸들러에 멱등성 로직 필수
noti_url은 SUCCESS를 수신할 때까지 최대 20회 반복 호출됩니다. 중복 서비스 제공을 방지하기 위해 `tid` 또는 `trade_id` 기반 중복 처리 방어 로직을 반드시 구현해야 합니다.

```javascript
// 이미 처리된 거래인지 확인
if (isAlreadyProcessed(trade_id)) {
  return res.send('SUCCESS'); // 반복 호출 중지를 위해 SUCCESS 출력
}
// 처리 후 완료 플래그 저장
processPayment(trade_id);
markAsProcessed(trade_id);
res.send('SUCCESS');
```

noti_url 처리의 상세 규칙과 전체 구현 예제는 `references/guides/noti-url.md`를 참조하세요.

### 4. 결제승인 API는 백엔드에서만 호출
`/MUP/api/approval` 엔드포인트는 반드시 서버 사이드에서만 호출합니다.

### 5. SUCCESS/FAIL 출력 규칙
noti_url 핸들러의 응답은 HTML이나 소스코드 없이 `SUCCESS` 또는 `FAIL` 문자열만 출력해야 합니다.

## 결제수단별 코드와 주요 옵션

| 결제수단 | cash_code | 주요 옵션 키 접두어 |
|----------|-----------|-------------------|
| 휴대폰 | `MC` | `pay_options.mc_*` |
| 신용카드 | `CN` | `pay_options.cn_*` |
| 실계좌이체 | `RA` | `pay_options.ra_*` |
| 가상계좌 | `VA` | `pay_options.va_*` |
| 간편결제 | `EP` (`ep_code`로 간편결제사 구분) | `pay_options.ep_*` |
| 교통카드(모바일티머니) | `TM` (`hybrid_pay=Y` 필수) | `pay_options.tm_*` |

간편결제 코드: `KKO`(카카오페이), `TOS`(토스), `NAV`(네이버페이), `SSP`(삼성페이), `PYC`(페이코), `LTP`(엘페이), `SSG`(SSG페이), `APP`(애플페이)

각 결제수단별 상세 파라미터는 `references/api/registration.md`의 해당 섹션을 참조하세요.

## 연동 시 주의사항

- 네이버페이(`ep_code=NAV`)는 iframe 환경에서 지원 불가 → `call_type`을 `P`(popup) 또는 `S`(self)로 설정
- 하이브리드결제 + 통합결제 동시 사용 시 실계좌이체는 결제수단으로 노출되지 않음
- 가상계좌 결제 시 `noti_url`은 입금완료 통보를 위해 반드시 필수
- 결제창 호출 시 form submit 방식 지양 → `window.open()`, `location.href`, iframe `src` 사용 권장
- 신용카드 서비스는 테스트서버 미제공

## references 디렉토리 안내

상세 API 명세나 코드 예제가 필요할 때 아래 파일을 참조하세요.

### API 레퍼런스 (`references/api/`)

| 파일 | 내용 |
|------|------|
| `registration.md` | 거래등록 API — 요청/응답 파라미터, 결제수단별 옵션(티머니페이 포함), 요청/응답 예제 |
| `payment-window.md` | 결제창 호출 — 팝업/iframe/QR 방식별 구현 방법 |
| `auth-response.md` | 인증/승인 응답 — ok_url/fail_url/noti_url 응답 파라미터 |
| `approval-tid.md` | 결제승인 — TID 기반 하이브리드결제 승인 API |
| `purchase.md` | 수동매입 API |
| `virtual-account.md` | 가상계좌 채번취소, 입금 후 처리 |
| `cancellation.md` | 결제취소 API (전체/부분취소) — `/MUP/api/cancellation` |
| `refund.md` | 환불 API (계좌이체) — `/MUP/api/cancellation (cancel_type=R)` |
| `escrow-delivery.md` | 에스크로 배송등록 API — 실계좌이체/가상계좌 배송정보 등록 |
| `cash-receipt.md` | 현금영수증 발급/취소 |
| `hmac.md` | HMAC 무결성 검증 — 거래등록/취소/에스크로별 메시지 구성, Java/C#/Node.js/Python/PHP 예제 |

### 연동 가이드 (`references/guides/`)

| 파일 | 내용 |
|------|------|
| `flow-normal.md` | 일반결제 플로우 순서도, 시퀀스 다이어그램 |
| `flow-hybrid.md` | 하이브리드결제 플로우, 일반결제와 비교표 |
| `noti-url.md` | noti_url 처리 규칙, 중복 방어 구현 예제, ok_url 비교 |
| `integration-guide.md` | 결제수단별 참고사항, 결제창 크기, 기술지원 연락처 |
| `firewall.md` | 방화벽 IP/PORT 설정 |

### 코드표/에러코드 (`references/reference/`)

| 파일 | 내용 |
|------|------|
| `error-codes.md` | API 에러코드, 현금영수증 에러코드 |
| `payment-codes.md` | 결제수단/신용카드/간편결제/금융기관/이통사 코드표 |

## 코드 생성 시 체크리스트

코드를 작성한 후 다음 항목을 반드시 확인하세요.

- [ ] skey가 환경변수에서 로드되는지 (하드코딩 금지)
- [ ] HMAC 검증이 서버사이드에서만 수행되는지
- [ ] noti_url 핸들러에 중복 거래 방어 로직이 있는지
- [ ] 결제승인 API 호출이 백엔드에서만 이루어지는지
- [ ] 금액 검증 로직이 포함되어 있는지 (요청 금액 vs 응답 금액 비교)
- [ ] code=0000 성공 여부 확인 로직이 있는지
- [ ] noti_url 응답이 SUCCESS/FAIL 문자열만 출력하는지
- [ ] 테스트/운영 호스트가 올바르게 분기되는지
