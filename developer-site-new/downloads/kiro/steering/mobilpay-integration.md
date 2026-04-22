# MOBILPAY 결제 연동 가이드

MOBILPAY(KG파이낸셜) REST API 결제 연동을 위한 가이드입니다. MOBILPAY, KG파이낸셜, 모빌페이, mobilians, 결제 연동, 거래등록, 결제승인, 결제취소, 환불, HMAC, noti_url 등을 언급하면 이 가이드를 적용합니다.

## 결제 플로우

### 일반결제 (hybrid_pay=N, 기본값)

거래등록 → 결제창 호출 → 사용자 결제 → ok_url로 승인결과 수신 → 검증 → 서비스 제공

3단계만 구현하면 되므로 빠르고 간단합니다. 단순 결제에 적합합니다.

### 하이브리드결제 (hybrid_pay=Y)

거래등록 → 결제창 호출 → 사용자 인증 → ok_url로 인증결과 수신 → 가맹점이 승인 API 호출 → 승인결과 수신 → 서비스 제공

승인 시점을 가맹점이 제어할 수 있어 복합결제, 장바구니 결제에 적합합니다.

## 핵심 API 엔드포인트

| 단계 | API | Method | Path |
|------|-----|--------|------|
| 거래등록 | Registration | POST | `/MUP/api/registration` |
| 결제승인 (TID) | Approval | POST | `/MUP/api/approval` |
| 결제승인 (MOBILID) | Approval | POST | `/MUP/api/approval` |
| 수동매입 | Purchase | POST | `/MUP/api/purchase` |
| 결제취소 | Cancel | POST | `/MUP/api/cancel` (cancel_type=C) |
| 환불 | Refund | POST | `/MUP/api/cancel` (cancel_type=R) |
| 가상계좌 채번취소 | Account Expire | POST | `/MUP/api/account-expire` |
| 현금영수증 | Cash Receipt | POST | `/MUP/api/cash-receipt` |

호스트:
- 테스트: `https://test.mobilians.co.kr`
- 운영: `https://mup.mobilians.co.kr`

공통 규약: Content-Type `application/json`, HTTPS(443), POST, 성공코드 `0000`

## 보안 규칙 (반드시 준수)

코드를 생성할 때 다음 규칙은 절대 위반하면 안 됩니다.

### 1. skey(서비스 키) 보호
`skey`는 HMAC 검증에 사용되는 비밀키입니다. 절대 클라이언트 코드에 하드코딩하지 마세요. 반드시 환경변수(`process.env.MOBILPAY_SKEY`)에서 로드해야 합니다.

```javascript
// 올바른 방법
const SKEY = process.env.MOBILPAY_SKEY;

// 절대 금지
const SKEY = "abc123secretkey"; // 하드코딩
```

### 2. HMAC 무결성 검증은 서버사이드 전용
HMAC-SHA256 검증 로직은 반드시 백엔드 서버에서만 수행합니다.

HMAC 메시지 구성: `amount(total)` + `ok_url` + `trade_id` + `time_stamp`

```javascript
const crypto = require('crypto');
const hmacMessage = amount + ok_url + trade_id + time_stamp;
const hmac = crypto.createHmac('sha256', SKEY)
  .update(hmacMessage, 'utf8')
  .digest('base64');
```

### 3. noti_url 핸들러에 멱등성 로직 필수
noti_url은 SUCCESS를 수신할 때까지 최대 20회 반복 호출됩니다. `tid` 또는 `trade_id` 기반 중복 처리 방어 로직을 반드시 구현해야 합니다.

```javascript
if (isAlreadyProcessed(trade_id)) {
  return res.send('SUCCESS');
}
processPayment(trade_id);
markAsProcessed(trade_id);
res.send('SUCCESS');
```

### 4. 결제승인 API는 백엔드에서만 호출
`/MUP/api/approval` 엔드포인트는 반드시 서버 사이드에서만 호출합니다.

### 5. SUCCESS/FAIL 출력 규칙
noti_url 핸들러의 응답은 HTML 없이 `SUCCESS` 또는 `FAIL` 문자열만 출력해야 합니다.

## 결제수단별 코드와 주요 옵션

| 결제수단 | cash_code | 주요 옵션 키 접두어 |
|----------|-----------|-------------------|
| 휴대폰 | `MC` | `pay_options.mc_*` |
| 신용카드 | `CN` | `pay_options.cn_*` |
| 실계좌이체 | `RA` | `pay_options.ra_*` |
| 가상계좌 | `VA` | `pay_options.va_*` |
| 간편결제 | `CN` (ep_code로 구분) | `pay_options.ep_*` |

간편결제 코드: `KKO`(카카오페이), `TOS`(토스), `NAV`(네이버페이), `SSP`(삼성페이), `PYC`(페이코), `LTP`(엘페이), `SSG`(SSG페이), `APP`(애플페이)

## 연동 시 주의사항

- 네이버페이(`ep_code=NAV`)는 iframe 환경에서 지원 불가 → `call_type`을 `P`(popup) 또는 `S`(self)로 설정
- 하이브리드결제 + 통합결제 동시 사용 시 실계좌이체는 결제수단으로 노출되지 않음
- 가상계좌 결제 시 `noti_url`은 입금완료 통보를 위해 반드시 필수
- 결제창 호출 시 form submit 방식 지양 → `window.open()`, `location.href`, iframe `src` 사용 권장
- 신용카드 서비스는 테스트서버 미제공

## 코드 생성 시 체크리스트

- [ ] skey가 환경변수에서 로드되는지 (하드코딩 금지)
- [ ] HMAC 검증이 서버사이드에서만 수행되는지
- [ ] noti_url 핸들러에 중복 거래 방어 로직이 있는지
- [ ] 결제승인 API 호출이 백엔드에서만 이루어지는지
- [ ] 금액 검증 로직이 포함되어 있는지 (요청 금액 vs 응답 금액 비교)
- [ ] code=0000 성공 여부 확인 로직이 있는지
- [ ] noti_url 응답이 SUCCESS/FAIL 문자열만 출력하는지
- [ ] 테스트/운영 호스트가 올바르게 분기되는지

## MCP 서버 활용

상세 API 명세가 필요하면 MCP Tool을 사용하세요:
- `get-docs` — 키워드 검색
- `get-payment-api-spec` — API 전체 명세 조회
- `get-payment-code-example` — 언어별 코드 예제
- `document-by-id` — 문서 ID로 조회 (id=0: 목록)
