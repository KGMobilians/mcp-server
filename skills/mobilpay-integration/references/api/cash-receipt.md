# 현금영수증

현금영수증 발급, 취소, 단독취소를 처리하는 API입니다. 실계좌이체, 가상계좌, 상품권 등 현금성 결제에 대해 현금영수증을 발급할 수 있습니다.

- **HTTP Method**: POST
- **Content-Type**: application/json
- **PATH**: `/MUP/api/cash-receipt`
- **운영서버**: `https://mup.mobilians.co.kr/MUP/api/cash-receipt`

## 요청 모드

| mode | 설명 |
|------|------|
| `45` | 현금영수증 발급 |
| `35` | 현금영수증 취소 (결제 건에 연동된 취소) |
| `55` | 현금영수증 단독취소 |

## 요청 파라미터

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `mode` | string | 2 | Y | 요청 모드. `45`: 발급, `35`: 취소, `55`: 단독취소 |
| `sid` | string | 32 | Y | 가맹점 코드 |
| `cash_code` | string | 2 | Y | 결제수단. `RA`: 실계좌이체, `VA`: 가상계좌, `GG`: 게임문화상품권, `GC`: 도서상품권, `HM`: 해피머니상품권, `TS`: 미거래요청 |
| `site_url` | string | 20 | Y | 가맹점 사이트 URL |
| `amount` | string | 12 | Y | 총 결제 금액 |
| `trade_id` | string | 80 | Y | 가맹점 거래번호 |
| `pay_token` | string | 20 | Y | 결제 인증 토큰. 취소 시 발급 응답의 `issue_request_no`를 사용 |
| `issue_type` | string | 1 | Y | 현금영수증 발급용도. `A`: 소득공제용, `B`: 지출증빙용 |
| `issue_code` | string | 1 | Y | 발행코드. `P`: 휴대폰번호, `C`: 카드번호, `B`: 사업자등록번호 |
| `issue_no` | string | 32 | Y | 발행번호 (신분확인번호). `issue_code`에 따라 휴대폰번호, 카드번호, 또는 사업자등록번호 |
| `bill_type` | string | 2 | Y | 과세구분. `00`: 과세, `10`: 비과세, `20`: 복합과세 |
| `user_name` | string | 30 | N | 사용자 이름 |
| `user_phone_no` | string | 20 | N | 사용자 연락처 |
| `user_email` | string | 50 | N | 사용자 이메일 |
| `product_name` | string | 255 | N | 상품명 |
| `business_no` | string | 10 | N | 사업자번호 |
| `tax` | string | 12 | N | 부가세 |

## 응답 파라미터

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `code` | string | 4 | Y | 응답 코드. `0000`: 성공 |
| `message` | string | 100 | Y | 응답 메시지 |
| `issue_type` | string | 1 | Y | 현금영수증 발급용도 |
| `issue_code` | string | 1 | Y | 발행코드 |
| `issue_no` | string | 32 | Y | 발행번호 |
| `approve_no` | string | 12 | N | 제휴사 승인번호 |
| `issue_request_no` | string | 20 | N | 발행요청번호. 취소 시 `pay_token`으로 사용 |
| `remain_amt` | string | 12 | N | 잔액 |

## 요청 예제 - 발급

```json
{
  "mode": "45",
  "sid": "YOUR_SID",
  "cash_code": "RA",
  "site_url": "www.example.com",
  "amount": "10000",
  "trade_id": "ORDER_20250704_001",
  "pay_token": "211215000017653",
  "issue_type": "A",
  "issue_code": "P",
  "issue_no": "01012345678",
  "bill_type": "00",
  "user_name": "홍길동",
  "user_phone_no": "01012345678",
  "user_email": "user@example.com",
  "product_name": "테스트상품"
}
```

## 응답 예제

```json
{
  "code": "0000",
  "message": "정상처리",
  "issue_type": "A",
  "issue_code": "P",
  "issue_no": "01012345678",
  "approve_no": "123456789012",
  "issue_request_no": "REQ_20250704_001"
}
```

## 주의사항

- 현금영수증 취소(`mode=35`) 시 `pay_token`에 발급 응답의 `issue_request_no` 값을 전달합니다.
- 현금영수증 에러코드는 별도의 현금영수증코드표를 참고하세요.
