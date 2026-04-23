# 결제 취소

승인 완료된 거래에 대해 전체 취소 또는 부분 취소를 요청하는 API입니다.

- **HTTP Method**: POST
- **Content-Type**: application/json
- **PATH**: `/MUP/api/cancellation`
- **운영서버**: `https://mup.mobilians.co.kr/MUP/api/cancellation`
- **테스트서버**: `https://test.mobilians.co.kr/MUP/api/cancellation`

> **보안 주의**: 결제 취소 API는 반드시 서버 사이드에서 호출해야 합니다. `hmac` 검증을 위해 `skey`가 필요하며, 이는 절대 클라이언트에 노출되면 안 됩니다.

> **PATH 주의**: 해시 검증이 있는 `/cancellation` 을 사용해야 합니다. 구 버전 `/cancel` 엔드포인트는 해시 검증이 없어 사용하면 안 됩니다.

## 요청 파라미터

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `sid` | string | 12 | Y | 가맹점 코드 |
| `trade_id` | string | 50 | Y | 가맹점 거래번호 |
| `cash_code` | string | 2 | Y | 결제수단. `MC`: 휴대폰, `CN`: 신용카드, `RA`: 실계좌이체, `VA`: 가상계좌, `EP`: 간편결제, `TM`: 모바일티머니 |
| `pay_token` | string | 50 | Y | 결제 토큰. 결제 승인 응답에서 받은 값 |
| `amount` | string | 10 | Y | **전체취소**: 총 결제 금액. **부분취소(휴대폰)**: 취소 후 남은 금액. **부분취소(그 외)**: 취소할 금액 |
| `cancel_type` | string | 1 | Y | 취소 구분. `C`: 고정값 |
| `part_cancel` | string | 1 | Y | `N`: 전체취소, `Y`: 부분취소. 휴대폰결제 취소 시 원거래 전체취소 또는 잔여금액 전체취소 |
| `hmac` | string | 44 | Y | 무결성 검증용 hash. 메시지 = `sid` + `trade_id` + `pay_token` + `amount` |

### 복합과세 부분취소 추가 파라미터 (신용카드)

신용카드 복합과세 결제의 부분취소에서 사용합니다. `cn_tax_ver=CPLX` 세팅 시 아래 4개 필드(`bill_type`, `tax`, `tax_free`, `tax_amount`)를 반드시 함께 전달해야 합니다.

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `cn_tax_ver` | string | 4 | 조건부 | 복합과세 부분취소 전문버전. `CPLX` 고정값. 신용카드 복합과세 부분취소 시 사용 |
| `bill_type` | string | 2 | 조건부 | 과세구분. `00`: 과세, `10`: 비과세, `20`: 복합과세. `cn_tax_ver=CPLX` 일 경우 필수 |
| `tax` | string | 10 | 조건부 | 부가세. `cn_tax_ver=CPLX` 일 경우 필수 |
| `tax_free` | string | 10 | 조건부 | 면세금액. `cn_tax_ver=CPLX` 일 경우 필수 |
| `tax_amount` | string | 10 | 조건부 | 과세금액. `cn_tax_ver=CPLX` 일 경우 필수 |

### 분할 정산 취소 추가 파라미터

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `divide_payment` | string | 1 | N | 분할 정산 결제 사용 여부. `Y`: 사용. 신용카드만 가능, 간편결제류/복합과세 불가 |
| `divide_payment_list` | array | - | 조건부 | `divide_payment=Y` 세팅 시 필수 |
| `divide_payment_list[].sid` | string | 12 | Y | 하위 가맹점 코드 |
| `divide_payment_list[].price` | string | 10 | Y | 취소 금액 |

## 응답 파라미터

| 필드 | 타입 | 최대길이 | 설명 |
|------|------|----------|------|
| `code` | string | 4 | 응답 코드. `0000`: 성공 |
| `message` | string | 100 | 응답 메시지 |
| `sid` | string | 12 | 가맹점 코드 |
| `cash_code` | string | 2 | 결제수단 |
| `pay_token` | string | 20 | 결제 토큰 |
| `amount` | string | 10 | 총 결제 금액 |
| `transaction_id` | string | 32 | 트랜젝션ID. 휴대폰결제(`cash_code=MC`)만 지원 |

## 요청 예제 - 전체 취소

```json
{
  "sid": "YOUR_SID",
  "trade_id": "ORDER_20250704_001",
  "cash_code": "MC",
  "pay_token": "1904258548577654668",
  "amount": "1000",
  "cancel_type": "C",
  "part_cancel": "N",
  "hmac": "I3qi5h256KJKTbbKAlC9pXFiVaAgb/E2ci6ZgkjzVsg="
}
```

## 요청 예제 - 부분 취소 (신용카드, 5000원 중 2000원 취소)

```json
{
  "sid": "YOUR_SID",
  "trade_id": "ORDER_20250704_003",
  "cash_code": "CN",
  "pay_token": "1904258548577654668",
  "amount": "2000",
  "cancel_type": "C",
  "part_cancel": "Y",
  "hmac": "계산된_HMAC_값"
}
```

## 요청 예제 - 부분 취소 (휴대폰, 5000원 중 2000원 취소 → 남은 금액 3000원 전달)

> **휴대폰 부분취소 주의**: 휴대폰결제의 `amount`는 취소할 금액이 아니라 **취소 후 남은 금액**입니다.

```json
{
  "sid": "YOUR_SID",
  "trade_id": "ORDER_20250704_002",
  "cash_code": "MC",
  "pay_token": "1904258548577654668",
  "amount": "3000",
  "cancel_type": "C",
  "part_cancel": "Y",
  "hmac": "계산된_HMAC_값"
}
```

## 요청 예제 - 복합과세 부분 취소 (신용카드)

신용카드 복합과세 결제의 부분취소 시 `cn_tax_ver=CPLX` 및 과세구분 필드 4종을 함께 전송합니다.

```json
{
  "sid": "YOUR_SID",
  "trade_id": "ORDER_20250704_010",
  "cash_code": "CN",
  "pay_token": "1904258548577654668",
  "amount": "10000",
  "cancel_type": "C",
  "part_cancel": "Y",
  "cn_tax_ver": "CPLX",
  "bill_type": "20",
  "tax": "500",
  "tax_free": "3000",
  "tax_amount": "6500",
  "hmac": "계산된_HMAC_값"
}
```

## 응답 예제

```json
{
  "code": "0000",
  "message": "정상처리",
  "sid": "YOUR_SID",
  "cash_code": "MC",
  "pay_token": "1904258548577654668",
  "amount": "1000",
  "transaction_id": "20230117MCNA5001170143A057923474"
}
```

## HMAC 계산 (취소용)

결제 취소 시 HMAC 메시지 구성은 거래등록/승인과 다릅니다.

- **key**: `skey`
- **message**: `sid` + `trade_id` + `pay_token` + `amount`
- **algorithm**: `Base64encode(HMAC_SHA256(key, message))`

```javascript
const crypto = require('crypto');
const SKEY = process.env.MOBILPAY_SKEY;

function calculateCancellationHmac(sid, tradeId, payToken, amount) {
  const message = String(sid) + String(tradeId) + String(payToken) + String(amount);
  return crypto.createHmac('sha256', SKEY)
    .update(message, 'utf8').digest('base64');
}
```

## 주의사항

- `cancel_type`은 항상 `C`로 고정합니다.
- 휴대폰결제(`cash_code=MC`) 부분취소 시 `amount`는 **취소 후 남은 금액**입니다. 다른 결제수단은 **취소할 금액**입니다.
- 취소 HMAC 메시지 구성(`sid + trade_id + pay_token + amount`)은 거래등록/승인 시 HMAC 메시지 구성과 다릅니다.
- 구 버전 `/MUP/api/cancel` 엔드포인트는 해시 검증이 없어 보안상 사용하지 말고 반드시 `/MUP/api/cancellation` 을 사용하세요.
