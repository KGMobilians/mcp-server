# 환불

환불은 계좌이체 결제 건에 대해 구매자의 계좌로 환불 금액을 이체하는 API입니다. 결제 취소와 동일한 엔드포인트(`/MUP/api/cancel`)를 사용하되, `cancel_type`을 `R`로 설정하고 환불 계좌 정보를 추가로 전달합니다.

- **HTTP Method**: POST
- **Content-Type**: application/json
- **PATH**: `/MUP/api/cancel`
- **운영서버**: `https://mup.mobilians.co.kr/MUP/api/cancel`

> **주의**: 환불은 결제 취소와 동일한 PATH를 사용합니다. `cancel_type` 값으로 구분됩니다. 취소: `cancel_type=C`, 환불: `cancel_type=R`

## 요청 파라미터

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `sid` | string | 12 | Y | 가맹점 코드 |
| `trade_id` | string | 50 | Y | 가맹점 거래번호 |
| `cash_code` | string | 2 | Y | 결제수단 |
| `pay_token` | string | 50 | Y | 결제 토큰 |
| `amount` | string | 10 | Y | 총 결제 금액 |
| `cancel_type` | string | 1 | Y | 환불 구분. `R`: 고정값 |
| `part_cancel` | string | 1 | Y | `N`: 전체환불, `Y`: 부분환불 |
| `bank_code` | string | 3 | Y | 환불받을 은행 코드. 금융기관코드표 참고 |
| `account_no` | string | 20 | Y | 환불받을 계좌 번호 |
| `account_name` | string | 50 | Y | 예금주 명 |
| `refund_amount` | string | 10 | Y | 환불 금액 |

## 응답 파라미터

| 필드 | 타입 | 최대길이 | 설명 |
|------|------|----------|------|
| `code` | string | 4 | 응답 코드. `0000`: 성공 |
| `message` | string | 100 | 응답 메시지 |
| `sid` | string | 12 | 가맹점 코드 |
| `cash_code` | string | 2 | 결제수단 |
| `pay_token` | string | 20 | 결제 토큰 |
| `amount` | string | 10 | 총 결제 금액 |
| `refund_amount` | string | 10 | 환불 금액 |

## 요청 예제

```json
{
  "sid": "000730010001",
  "trade_id": "ORDER_20250704_001",
  "cash_code": "MC",
  "pay_token": "1904258548577654668",
  "amount": "1000",
  "cancel_type": "R",
  "part_cancel": "N",
  "bank_code": "003",
  "account_no": "12345678901234",
  "account_name": "홍길동",
  "refund_amount": "1000"
}
```

## 응답 예제

```json
{
  "code": "0000",
  "message": "정상처리",
  "sid": "000730010001",
  "cash_code": "MC",
  "pay_token": "1904258548577654668",
  "amount": "1000",
  "refund_amount": "1000"
}
```

## 결제 취소와 환불의 차이

| 구분 | 결제 취소 (`cancel_type=C`) | 환불 (`cancel_type=R`) |
|------|---------------------------|----------------------|
| 용도 | 카드 결제 취소, 통신사 결제 취소 | 구매자 계좌로 금액 이체 |
| 계좌 정보 | 불필요 | 필수 (`bank_code`, `account_no`, `account_name`) |
| 환불 금액 필드 | 불필요 | 필수 (`refund_amount`) |
| 부분 처리 | `part_cancel=Y`로 부분취소 | `part_cancel=Y`로 부분환불 |
