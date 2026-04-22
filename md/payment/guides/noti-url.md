# noti_url 처리 가이드

`noti_url`은 결제 승인 결과를 시스템 back단에서 가맹점 서버로 전달하는 URL입니다. 가맹점의 결제 처리 실패를 낮추기 위해 SUCCESS를 수신할 때까지 최대 20회 반복 호출합니다.

## noti_url의 역할

- **일반결제**: `ok_url`과 함께 승인 결과를 이중으로 전달. `ok_url` 처리 실패에 대한 안전장치
- **가상계좌**: 사용자 입금 완료 시 통보. 가상계좌에서는 **반드시 필수**

## noti_url 처리 규칙

### SUCCESS/FAIL 출력 규칙

| 출력 | 조건 | 설명 |
|------|------|------|
| `SUCCESS` | 가맹점 결제 후 처리 성공 | 고객에게 서비스가 정상적으로 제공되는 경우 |
| `FAIL` | 가맹점 측 결제 후 처리 실패 | 가맹점 사정으로 고객에게 정상 서비스 제공 불가 |

> **중요**: SUCCESS/FAIL 출력은 소스코드나 HTML 코드 없이 **해당 문자만** 페이지상에 출력해야 합니다.

### SUCCESS 출력 전 필수 확인 항목

1. **code**: `0000` (결제 성공) 여부 확인
2. **pay_token**: 결제 토큰 (최대 15byte) 존재 확인
3. **amount**: 최초 요청한 금액과 동일한지 **반드시** 확인
4. **IP**: noti_url 페이지 호출 IP가 KG파이낸셜 결제서버군인지 확인
5. **hmac**: HMAC 무결성 검증 통과 확인

### 반복 호출 및 중복 방어

- SUCCESS를 출력하지 않으면 noti_url 페이지를 **최대 20회** 반복 호출합니다.
- 재호출로 인해 **서비스 중복 제공**이 발생할 수 있습니다.
- 처리 완료된 중복 거래건이 재호출될 경우 **SUCCESS를 출력**하는 방어 로직을 반드시 구현해야 합니다.

## 구현 예제 (Node.js/Express)

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.urlencoded({ extended: true }));

const SKEY = process.env.MOBILPAY_SKEY;

// KG파이낸셜 결제서버 IP 목록
const ALLOWED_IPS = [
  '175.158.12.1',   // 메인 NOTI 서버
  '175.158.12.2',   // 테스트 NOTI 서버
  '116.127.121.132' // 백업 NOTI 서버
];

app.post('/payment/noti', (req, res) => {
  // 1. IP 검증
  const clientIP = (req.ip || req.connection.remoteAddress || '')
    .replace('::ffff:', '');
  if (!ALLOWED_IPS.includes(clientIP)) {
    console.error('허용되지 않은 IP:', clientIP);
    return res.send('FAIL');
  }

  const { code, pay_token, amount, trade_id, hmac, cash_code } = req.body;

  // 2. 응답 코드 확인
  if (code !== '0000') {
    console.error('결제 실패:', code, req.body.message);
    return res.send('FAIL');
  }

  // 3. pay_token 존재 확인
  if (!pay_token || pay_token.length > 15) {
    console.error('유효하지 않은 pay_token');
    return res.send('FAIL');
  }

  // 4. 금액 검증
  const originalAmount = getOriginalAmountFromDB(trade_id);
  if (String(originalAmount) !== String(amount)) {
    console.error('금액 불일치:', originalAmount, '!=', amount);
    return res.send('FAIL');
  }

  // 5. HMAC 검증
  const storedTimeStamp = getStoredTimeStampFromDB(trade_id);
  const hmacMessage = amount + 'https://www.example.com/payment/result'
    + trade_id + storedTimeStamp;
  const calculatedHmac = crypto.createHmac('sha256', SKEY)
    .update(hmacMessage, 'utf8').digest('base64');
  if (calculatedHmac !== hmac) {
    console.error('HMAC 검증 실패');
    return res.send('FAIL');
  }

  // 6. 중복 거래 방어 (핵심!)
  if (isAlreadyProcessed(trade_id)) {
    // 이미 처리 완료된 거래 → SUCCESS 출력하여 반복 호출 중지
    console.log('이미 처리된 거래:', trade_id);
    return res.send('SUCCESS');
  }

  // 7. 결제 성공 처리
  try {
    processPaymentSuccess(trade_id, pay_token, amount, cash_code);
    // 처리 완료 플래그 저장
    markAsProcessed(trade_id);
    res.send('SUCCESS');
  } catch (err) {
    console.error('결제 처리 실패:', err);
    res.send('FAIL');
  }
});
```

## 잘못된 noti_url 처리 예시

```html
<!-- ❌ 잘못된 예시: HTML 코드가 포함됨 -->
<html><body>SUCCESS</body></html>

<!-- ❌ 잘못된 예시: 소스코드가 포함됨 -->
<?php echo "SUCCESS"; ?>
<html>...</html>
```

```
✅ 올바른 예시: 문자만 출력
SUCCESS
```

## noti_url vs ok_url

| 구분 | ok_url | noti_url |
|------|--------|----------|
| 호출 주체 | 사용자 브라우저 (결제창에서 리다이렉트) | MOBILPAY 시스템 서버 (back단) |
| 호출 횟수 | 1회 | SUCCESS 수신까지 최대 20회 |
| 용도 | 사용자에게 결제 결과 화면 표시 | 서버 간 결제 결과 동기화 |
| 가상계좌 | 가상계좌 발급 정보 전달 | 입금 완료 통보 |
| 필수 여부 | 필수 | 선택 (가상계좌는 필수) |
