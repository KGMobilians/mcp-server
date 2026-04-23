# 수동 매입

수동 매입은 결제 승인 후 카드사에 매입을 별도로 요청하는 API입니다. 신용카드와 간편결제에서만 사용할 수 있습니다. 일반적인 결제에서는 승인과 동시에 자동 매입이 이루어지므로, 수동 매입이 필요한 가맹점에서만 사용합니다.

- **HTTP Method**: POST
- **Content-Type**: application/json
- **URL**: `https://mup.mobilians.co.kr/MUP/api/purchase`

> **참고**: 수동 매입은 결제수단이 신용카드(`cash_code=CN`) 또는 간편결제인 경우에만 해당합니다.

## 요청 파라미터

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `sid` | string | 12 | Y | 가맹점 코드 |
| `trade_id` | string | 40 | Y | 가맹점 거래번호 |
| `cash_code` | string | 2 | Y | 결제수단. `CN`: 신용카드 |
| `pay_token` | string | 50 | Y | 결제 토큰. 결제 승인 응답에서 받은 값 |

## 응답 파라미터

| 필드 | 타입 | 최대길이 | 설명 |
|------|------|----------|------|
| `code` | string | 4 | 응답 코드. `0000`: 성공 |
| `message` | string | 100 | 응답 메시지 |
| `sign_date` | string | 14 | 매입시간 |
| `trade_id` | string | 40 | 가맹점 거래번호 |
| `pay_token` | string | 20 | 결제 토큰 |

## 요청 예제

```json
{
  "sid": "YOUR_SID",
  "trade_id": "ORDER_20250704_001",
  "cash_code": "CN",
  "pay_token": "1904258548577654668"
}
```

## 응답 예제

```json
{
  "code": "0000",
  "message": "정상처리",
  "sign_date": "20190619160850",
  "trade_id": "ORDER_20250704_001",
  "pay_token": "1904258548577654668"
}
```
