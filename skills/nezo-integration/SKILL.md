---
name: nezo-integration
description: >
  내죠여왕(NEZO) 카카오 알림톡 결제서비스 연동 전문가 스킬. 결제 요청(/send), 결제 조회(/send/view), 결제 취소(/cancel), 결제 재요청, 콜백 핸들러 구현, MAC(HmacSHA256) 생성/검증, 에러 처리 등 내죠여왕 결제 시스템 연동의 모든 단계를 가이드합니다.
  이 스킬은 사용자가 내죠여왕, NEZO, 알림톡 결제, 알림톡 결제요청, 카카오 알림톡 결제 등을 언급하거나,
  내죠여왕 결제 요청/조회/취소/재요청, MAC 생성/검증, callback_url 처리, return_url 처리 등을 요청할 때 사용합니다.
---

# 내죠여왕(NEZO) 알림톡 결제 연동 스킬

내죠여왕(NEZO)은 카카오 알림톡을 이용한 결제 요청 서비스입니다. 이 스킬을 통해 정확한 API 명세에 기반한 코드를 생성하고, 보안 규칙을 자동으로 적용할 수 있습니다.

## 스킬을 사용하는 이유

내죠여왕 결제 연동은 결제요청 → 알림톡 발송 → 고객 결제 → 콜백 수신까지 여러 단계로 구성되어 있고, 각 단계마다 HmacSHA256 MAC 생성/검증이 필요합니다. AI가 일반 지식만으로 코드를 생성하면 MAC KEY 구성이 틀리거나, 콜백 핸들러에 멱등성 로직을 누락하는 실수가 발생합니다. 이 스킬은 공식 API 명세를 references에 포함하고 있으므로, 이를 참조하여 정확한 코드를 생성할 수 있습니다.

## 작업 시작 전 확인사항

1. 사용자가 어떤 **API**를 연동하려는지 파악 (결제요청/조회/취소/재요청/콜백)
2. 사용자의 **프로그래밍 언어와 프레임워크** 확인
3. **테스트 환경**인지 **운영 환경**인지 확인
4. 알림톡 발송 여부(`send_msg_yn`) 확인 — N이면 link_url 직접 사용

## 결제 플로우 개요

```
가맹점 서버 → 결제요청 API(/send) → 알림톡 발송 → 고객 결제 → callback_url로 결과 수신
```

1. 가맹점이 `/send` API를 호출하여 결제 요청
2. 고객에게 카카오 알림톡으로 결제 링크 발송 (또는 `send_msg_yn=N`이면 link_url 응답)
3. 고객이 결제 링크에서 결제 완료
4. KG파이낸셜가 가맹점의 `callback_url`로 결제 결과 POST
5. 가맹점이 결제 결과 처리 (MAC 검증 → 중복 확인 → 서비스 제공)

## 핵심 API 엔드포인트

| API | Method | 엔드포인트 | 설명 |
|-----|--------|-----------|------|
| 결제 요청 | POST | `/send` | 알림톡 결제 요청 발송 |
| 결제 조회 | POST | `/send/view` | 결제 상태 조회 |
| 결제 취소 | POST | `/cancel` | 결제 취소 처리 |
| 결제 재요청 | POST | (재전송) | 알림톡 재발송 |

호스트:
- 테스트: `https://test.mpps.co.kr/buy4me`
- 운영: `https://www.nezo.co.kr`

공통 규약: Content-Type `application/x-www-form-urlencoded`, HTTPS(443), POST, 성공코드 `0000`

## 보안 규칙 (반드시 준수)

### 1. svc_id & MAC_KEY 보호
`svc_id`와 `MAC_KEY`는 절대 클라이언트(프론트엔드) 코드에 포함하지 마세요. 반드시 환경변수에서 로드합니다.

```javascript
// ✅ 올바른 방법
const SVC_ID = process.env.NEZO_SVC_ID;
const MAC_KEY = process.env.NEZO_MAC_KEY;

// ❌ 절대 금지
const MAC_KEY = "abc123secretkey"; // 하드코딩
```

### 2. MAC(HmacSHA256) 생성/검증은 서버사이드 전용
MAC 생성/검증 로직은 반드시 백엔드 서버에서만 수행합니다.

요청 MAC KEY: `svc_id + send_dttm + MAC_KEY`
응답 MAC KEY: `svc_id + sys_dttm + MAC_KEY`

```javascript
const crypto = require('crypto');
const key = SVC_ID + sendDttm + MAC_KEY;
const mac = crypto.createHmac('sha256', key).update('').digest('hex');
```

각 언어별 MAC 구현 예제가 필요하면 `references/reference/mac-guide.md`를 참조하세요.

### 3. callback_url 핸들러에 멱등성 로직 필수
callback_url은 HTTP 200을 수신할 때까지 재시도될 수 있습니다. `trade_no` 기반 중복 처리 방어 로직을 반드시 구현하세요.

```javascript
if (isAlreadyProcessed(trade_no)) {
  return res.status(200).send('OK');
}
processPayment(trade_no, pay_no);
markAsProcessed(trade_no);
res.status(200).send('OK');
```

### 4. 결제 API는 백엔드에서만 호출
결제요청/조회/취소 API는 반드시 서버 사이드에서만 호출합니다.

### 5. 전문 유효시간 10분
요청 전문의 유효 시간은 10분입니다. `send_dttm`을 적절히 관리하세요.

### 6. callback_url 형식
완전한 URL 형식이 필요합니다. (예: `https://example.com/pay/callback`)

### 7. HTTP 200 응답 필수
callback_url 핸들러는 반드시 HTTP 200을 반환해야 합니다. 그렇지 않으면 재시도가 발생합니다.

## 결제수단 코드

| 결제수단 | pay_method |
|----------|-----------|
| 휴대폰 | `MC` |
| 신용카드 | `CN` |

## references 디렉토리 안내

### API 레퍼런스 (`references/api/`)

| 파일 | 내용 |
|------|------|
| `send.md` | 결제 요청 API — 요청/응답 파라미터, 요청/응답 예제, Node.js/Java 구현 예제 |
| `callback.md` | 콜백/리턴 URL — 콜백 파라미터, 핸들러 구현 예제 |
| `search.md` | 결제 조회 API — 요청/응답 파라미터, 상태별 응답 예시 |
| `cancel.md` | 결제 취소 API — 요청/응답 파라미터, Node.js/Java 구현 예제 |
| `resend.md` | 결제 재요청 API — 요청/응답 파라미터 |

### 연동 가이드 (`references/guides/`)

| 파일 | 내용 |
|------|------|
| `start.md` | 서비스 개요, 접속정보, API 목록, MAC 설명, 보안 규칙 |
| `firewall.md` | 방화벽 IP/PORT 설정 |

### 레퍼런스 (`references/reference/`)

| 파일 | 내용 |
|------|------|
| `response-codes.md` | 공통 응답 코드(result_cd) 전체 목록 |
| `mac-guide.md` | MAC 생성/검증 방법 — Java/C#/Node.js/Python/PHP 예제 |

## 코드 생성 시 체크리스트

코드를 작성한 후 다음 항목을 반드시 확인하세요.

- [ ] svc_id와 MAC_KEY가 환경변수에서 로드되는지 (하드코딩 금지)
- [ ] 요청 MAC이 올바르게 생성되는지 (KEY = svc_id + send_dttm + MAC_KEY)
- [ ] 응답 MAC 검증이 수행되는지 (KEY = svc_id + sys_dttm + MAC_KEY)
- [ ] callback_url 핸들러에 중복 처리 방어 로직이 있는지
- [ ] callback_url 핸들러가 HTTP 200을 반환하는지
- [ ] result_cd=0000 성공 여부 확인 로직이 있는지
- [ ] 테스트/운영 호스트가 올바르게 분기되는지
- [ ] trade_no가 매 요청마다 unique한 값인지
