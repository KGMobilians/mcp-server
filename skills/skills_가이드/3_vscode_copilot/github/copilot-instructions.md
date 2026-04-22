# 결제 연동 가이드

이 프로젝트에서 결제 관련 코드를 작성할 때 아래 규칙을 반드시 준수하세요.

---

## MOBILPAY(KG파이낸셜) REST API 결제 연동

### 결제 플로우

**일반결제 (hybrid_pay=N, 기본값)**
거래등록 → 결제창 호출 → 사용자 결제 → ok_url로 승인결과 수신 → 검증 → 서비스 제공

**하이브리드결제 (hybrid_pay=Y)**
거래등록 → 결제창 호출 → 사용자 인증 → ok_url로 인증결과 수신 → 가맹점이 승인 API 호출 → 승인결과 수신 → 서비스 제공

### 핵심 API 엔드포인트

| 단계 | Method | Path |
|------|--------|------|
| 거래등록 | POST | `/MUP/api/registration` |
| 결제승인 (TID) | POST | `/MUP/api/approval` |
| 결제승인 (MOBILID) | POST | `/MUP/api/approval` |
| 수동매입 | POST | `/MUP/api/purchase` |
| 결제취소 | POST | `/MUP/api/cancel` (cancel_type=C) |
| 환불 | POST | `/MUP/api/cancel` (cancel_type=R) |
| 가상계좌 채번취소 | POST | `/MUP/api/account-expire` |
| 현금영수증 | POST | `/MUP/api/cash-receipt` |

- 테스트: `https://test.mobilians.co.kr`
- 운영: `https://mup.mobilians.co.kr`
- 공통: Content-Type `application/json`, HTTPS(443), POST, 성공코드 `0000`

### 보안 규칙 (반드시 준수)

1. **skey(서비스 키) 보호**: 절대 클라이언트 코드에 하드코딩 금지. 환경변수(`process.env.MOBILPAY_SKEY`)에서 로드.
2. **HMAC 무결성 검증은 서버사이드 전용**: HMAC 메시지 = `amount(total)` + `ok_url` + `trade_id` + `time_stamp`
3. **noti_url 핸들러에 멱등성 로직 필수**: SUCCESS 수신까지 최대 20회 반복 호출. `tid` 기반 중복 방어 필수.
4. **결제승인 API는 백엔드에서만 호출**: `/MUP/api/approval`은 반드시 서버 사이드에서만.
5. **SUCCESS/FAIL 출력 규칙**: noti_url 응답은 HTML 없이 `SUCCESS` 또는 `FAIL` 문자열만 출력.

### 결제수단 코드

| 결제수단 | cash_code | 주요 옵션 |
|----------|-----------|----------|
| 휴대폰 | `MC` | `pay_options.mc_*` |
| 신용카드 | `CN` | `pay_options.cn_*` |
| 실계좌이체 | `RA` | `pay_options.ra_*` |
| 가상계좌 | `VA` | `pay_options.va_*` |
| 간편결제 | `CN` (ep_code로 구분) | `pay_options.ep_*` |

간편결제: `KKO`(카카오페이), `TOS`(토스), `NAV`(네이버페이), `SSP`(삼성페이), `PYC`(페이코), `LTP`(엘페이), `SSG`(SSG페이), `APP`(애플페이)

### MOBILPAY 코드 생성 체크리스트

- [ ] skey가 환경변수에서 로드되는지
- [ ] HMAC 검증이 서버사이드에서만 수행되는지
- [ ] noti_url 핸들러에 중복 거래 방어 로직이 있는지
- [ ] 결제승인 API 호출이 백엔드에서만 이루어지는지
- [ ] 금액 검증 로직이 포함되어 있는지
- [ ] code=0000 성공 여부 확인 로직이 있는지
- [ ] noti_url 응답이 SUCCESS/FAIL 문자열만 출력하는지
- [ ] 테스트/운영 호스트가 올바르게 분기되는지

---

## 내죠여왕(NEZO) 알림톡 결제서비스 연동

### 결제 플로우

```
가맹점 서버 → /send API → 알림톡 발송 → 고객 결제 → callback_url로 결과 수신
```

1. 가맹점이 `/send` API 호출하여 결제 요청
2. 고객에게 카카오 알림톡으로 결제 링크 발송 (또는 `send_msg_yn=N`이면 link_url 응답)
3. 고객이 결제 링크에서 결제 완료
4. KG파이낸셜가 가맹점의 `callback_url`로 결제 결과 POST
5. 가맹점이 결제 결과 처리 (MAC 검증 → 중복 확인 → 서비스 제공)

### 핵심 API 엔드포인트

| API | Method | 엔드포인트 |
|-----|--------|-----------|
| 결제 요청 | POST | `/send` |
| 결제 조회 | POST | `/send/view` |
| 결제 취소 | POST | `/cancel` |
| 결제 재요청 | POST | (재전송) |

- 테스트: `https://test.mpps.co.kr/buy4me`
- 운영: `https://www.nezo.co.kr`
- 공통: Content-Type `application/x-www-form-urlencoded`, HTTPS(443), POST, 성공코드 `0000`

### 보안 규칙 (반드시 준수)

1. **svc_id & MAC_KEY 보호**: 절대 클라이언트 코드에 포함 금지. 환경변수에서 로드.
2. **MAC(HmacSHA256) 생성/검증은 서버사이드 전용**: 요청 KEY = `svc_id + send_dttm + MAC_KEY`, 응답 KEY = `svc_id + sys_dttm + MAC_KEY`. 결과는 64자리 대문자 HEX.
3. **callback_url 핸들러에 멱등성 로직 필수**: HTTP 200 미수신 시 재시도 발생. `trade_no` 기반 중복 방어 필수.
4. **결제 API는 백엔드에서만 호출**
5. **전문 유효시간 10분**: `send_dttm` 기준 10분 초과 시 오류.
6. **callback_url은 완전한 URL 형식 필수** (예: `https://example.com/pay/callback`)
7. **callback_url 핸들러는 반드시 HTTP 200 반환**

### 결제수단 코드

| 결제수단 | pay_method |
|----------|-----------|
| 휴대폰 | `MC` |
| 신용카드 | `CN` |

### NEZO 코드 생성 체크리스트

- [ ] svc_id와 MAC_KEY가 환경변수에서 로드되는지
- [ ] 요청 MAC이 올바르게 생성되는지 (KEY = svc_id + send_dttm + MAC_KEY, 대문자 HEX)
- [ ] 응답 MAC 검증이 수행되는지 (KEY = svc_id + sys_dttm + MAC_KEY)
- [ ] callback_url 핸들러에 중복 처리 방어 로직이 있는지
- [ ] callback_url 핸들러가 HTTP 200을 반환하는지
- [ ] result_cd=0000 성공 여부 확인 로직이 있는지
- [ ] 테스트/운영 호스트가 올바르게 분기되는지
- [ ] trade_no가 매 요청마다 unique한 값인지

---

## MCP 서버 활용

상세 API 명세가 필요하면 mobilpay MCP 서버의 도구를 사용하세요:

| Tool | 용도 |
|------|------|
| `get-docs` | 키워드 검색 (MOBILPAY + NEZO 통합) |
| `document-by-id` | 문서 ID로 전체 내용 조회 (id=0: 목록) |
| `get-payment-api-spec` | MOBILPAY API 전체 명세 조회 |
| `get-payment-code-example` | MOBILPAY 언어별 코드 예제 |
| `get-nezo-api-spec` | 내죠여왕 API 전체 명세 조회 |
| `get-nezo-code-example` | 내죠여왕 언어별 코드 예제 |
