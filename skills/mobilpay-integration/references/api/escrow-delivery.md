# 에스크로 배송등록

에스크로가 적용된 실계좌이체(`cash_code=RA`) 또는 가상계좌(`cash_code=VA`) 결제 건에 대해, 구매자에게 발송한 배송정보를 KG파이낸셜에 등록하는 API입니다. 에스크로 결제의 구매 확정/환불 절차에 필요합니다.

- **HTTP Method**: POST
- **Content-Type**: application/json
- **PATH**: `/MUP/api/escrow/delivery`
- **운영서버**: `https://mup.mobilians.co.kr/MUP/api/escrow/delivery`
- **테스트서버**: `https://test.mobilians.co.kr/MUP/api/escrow/delivery`

> **보안 주의**: 에스크로 배송등록 API는 반드시 서버 사이드에서 호출해야 합니다.

## 요청 파라미터

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `sid` | string | 12 | Y | 가맹점 코드 |
| `cash_code` | string | 2 | Y | 결제수단. `RA`: 실계좌이체, `VA`: 가상계좌 |
| `site_url` | string | 20 | Y | 가맹점 사이트 URL |
| `pay_token` | string | 50 | Y | 결제 토큰. 결제 승인 응답에서 받은 값 |
| `amount` | string | 10 | Y | 총 결제 금액 |
| `sign_date` | string | 14 | Y | 승인시간. 결제 승인 응답의 `sign_date` 값. `yyyymmddhhmmss` 형식 |
| `dlv_corp_nm` | string | 50 | Y | 배송업체명 (예: `CJ대한통운`, `한진택배`, `우체국`) |
| `invoice_no` | string | 30 | Y | 송장번호 |
| `hmac` | string | 44 | Y | 무결성 검증용 hash. 메시지 = `sid` + `pay_token` + `amount` + `sign_date` |

## 응답 파라미터

| 필드 | 타입 | 최대길이 | 설명 |
|------|------|----------|------|
| `code` | string | 4 | 응답 코드. `0000`: 성공 |
| `message` | string | 100 | 응답 메시지 |
| `sid` | string | 12 | 가맹점 코드 |
| `pay_token` | string | 20 | 결제 토큰 |
| `dlv_reg_date` | string | 14 | 배송 등록 일시. `yyyymmddhhmmss` 형식 |

## 요청 예제

```json
{
  "sid": "YOUR_SID",
  "cash_code": "RA",
  "site_url": "www.example.com",
  "pay_token": "1904258548577654668",
  "amount": "50000",
  "sign_date": "20260423101530",
  "dlv_corp_nm": "CJ대한통운",
  "invoice_no": "123456789012",
  "hmac": "계산된_HMAC_값"
}
```

## 응답 예제

```json
{
  "code": "0000",
  "message": "정상처리",
  "sid": "YOUR_SID",
  "pay_token": "1904258548577654668",
  "dlv_reg_date": "20260423104521"
}
```

## 구현 예제 (Node.js/Express)

```javascript
const crypto = require('crypto');
const SKEY = process.env.MOBILPAY_SKEY;
const SID = process.env.MOBILPAY_SID;
const API_DOMAIN = process.env.NODE_ENV === 'production'
  ? 'https://mup.mobilians.co.kr'
  : 'https://test.mobilians.co.kr';

function calculateEscrowHmac(sid, payToken, amount, signDate) {
  const message = String(sid) + String(payToken) + String(amount) + String(signDate);
  return crypto.createHmac('sha256', SKEY)
    .update(message, 'utf8').digest('base64');
}

app.post('/escrow/delivery', async (req, res) => {
  const { cash_code, pay_token, amount, sign_date, dlv_corp_nm, invoice_no } = req.body;

  const body = {
    sid: SID,
    cash_code,
    site_url: 'www.example.com',
    pay_token,
    amount: String(amount),
    sign_date,
    dlv_corp_nm,
    invoice_no,
    hmac: calculateEscrowHmac(SID, pay_token, amount, sign_date),
  };

  const response = await fetch(API_DOMAIN + '/MUP/api/escrow/delivery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();

  if (result.code === '0000') {
    markDeliveryRegistered(pay_token, result.dlv_reg_date);
    return res.json({ ok: true, dlv_reg_date: result.dlv_reg_date });
  }
  return res.status(400).json({ ok: false, message: result.message });
});
```

## 구현 예제 (Java)

```java
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public String escrowHmac(String sid, String payToken, String amount, String signDate) throws Exception {
    String message = sid + payToken + amount + signDate;
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(
        System.getenv("MOBILPAY_SKEY").getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
    return Base64.getEncoder().encodeToString(
        mac.doFinal(message.getBytes(StandardCharsets.UTF_8)));
}
```

## 주의사항

- `cash_code`는 에스크로가 적용된 실계좌이체(`RA`) 또는 가상계좌(`VA`)만 지원합니다.
- `sign_date`는 결제 승인 응답에서 받은 값을 그대로 사용해야 HMAC 검증이 일치합니다.
- 배송등록은 1회성 처리이며, 동일 `pay_token`에 대한 중복 등록은 실패 처리됩니다.
- 에스크로 배송등록 HMAC 메시지 구성(`sid + pay_token + amount + sign_date`)은 거래등록/승인/취소 메시지 구성과 다릅니다.
