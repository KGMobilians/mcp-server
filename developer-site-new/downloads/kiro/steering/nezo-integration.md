# 내죠여왕(NEZO) 알림톡 결제 연동 가이드

내죠여왕(NEZO)은 카카오 알림톡을 이용한 결제 요청 서비스입니다. 내죠여왕, NEZO, 알림톡 결제, 알림톡 결제요청, 카카오 알림톡 결제, buy4me 등을 언급하면 이 가이드를 적용합니다.

## 결제 플로우

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
`svc_id`와 `MAC_KEY`는 절대 클라이언트 코드에 포함하지 마세요. 반드시 환경변수에서 로드합니다.

```javascript
// 올바른 방법
const SVC_ID = process.env.NEZO_SVC_ID;
const MAC_KEY = process.env.NEZO_MAC_KEY;

// 절대 금지
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
callback_url 핸들러는 반드시 HTTP 200을 반환해야 합니다.

## 결제수단 코드

| 결제수단 | pay_method |
|----------|-----------|
| 휴대폰 | `MC` |
| 신용카드 | `CN` |

## 코드 생성 시 체크리스트

- [ ] svc_id와 MAC_KEY가 환경변수에서 로드되는지 (하드코딩 금지)
- [ ] 요청 MAC이 올바르게 생성되는지 (KEY = svc_id + send_dttm + MAC_KEY)
- [ ] 응답 MAC 검증이 수행되는지 (KEY = svc_id + sys_dttm + MAC_KEY)
- [ ] callback_url 핸들러에 중복 처리 방어 로직이 있는지
- [ ] callback_url 핸들러가 HTTP 200을 반환하는지
- [ ] result_cd=0000 성공 여부 확인 로직이 있는지
- [ ] 테스트/운영 호스트가 올바르게 분기되는지
- [ ] trade_no가 매 요청마다 unique한 값인지

## MCP 서버 활용

상세 API 명세가 필요하면 MCP Tool을 사용하세요:
- `get-docs` — 키워드 검색
- `get-nezo-api-spec` — API 전체 명세 조회
- `get-nezo-code-example` — 언어별 코드 예제
- `document-by-id` — 문서 ID로 조회 (id=0: 목록)
