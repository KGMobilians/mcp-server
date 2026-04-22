# 결제 완료 콜백 URL & Return URL

고객의 결제가 완료되면 KG파이낸셜가 가맹점의 Callback URL을 호출하여 결제 결과를 전달합니다.

## Callback URL

### 개요

- 결제 요청 시 `callback_url`에 지정한 URL로 결제 결과를 POST 방식으로 전달
- KG파이낸셜는 **HTTP 상태코드 200**을 수신해야 성공으로 판단
- 200이 아닌 경우 재시도할 수 있으므로 **멱등성** 구현 필수

### 콜백 파라미터

| 파라미터 | 설명 |
|---------|------|
| `result_cd` | 결과 코드 (0000: 성공) |
| `result_msg` | 결과 메시지 |
| `svc_id` | KG파이낸셜 부여 서비스 아이디 |
| `trade_no` | 가맹점 거래번호 (결제 요청 시 전달한 unique 값) |
| `recv_hp` | 결제 수신자 전화번호 |
| `send_id` | 결제 요청자 아이디 |
| `item_id` | 상품 아이디 |
| `item_price` | 상품 가격 |
| `sys_dttm` | 처리 일시 (YYYYMMDDHHMISS) |
| `pay_no` | **KG파이낸셜 결제 번호** (결제 완료 시 발급) |
| `pay_method` | 결제 구분. `MC`: 휴대폰, `CN`: 신용카드 |
| `auto_bill_key` | 자동결제 Key (자동결제 등록 시에만 응답) |
| `user_key` | 자동결제 User Key (자동결제 등록 시에만 응답) |
| `mac` | MAC 검증값 |

### 콜백 MAC 검증

```
MAC KEY = svc_id + sys_dttm + 별도제공KEY
```

## Return URL

### 개요

- 결제 요청 시 `return_url`에 URL을 설정하면, KG파이낸셜 기본 결제 완료 화면 대신 **가맹점의 별도 결제 완료 화면**을 호출합니다
- Return URL에도 Callback URL과 **동일한 파라미터**가 전달됩니다
- Return URL은 선택사항이며, 미설정 시 KG파이낸셜 기본 화면이 표시됩니다

## 콜백 핸들러 구현 예제

### Node.js (Express)

```javascript
const crypto = require('crypto');

const SVC_ID = process.env.NEZO_SVC_ID;
const MAC_KEY = process.env.NEZO_MAC_KEY;

app.post('/pay/callback', async (req, res) => {
  const { result_cd, result_msg, trade_no, pay_no, pay_method, sys_dttm, mac } = req.body;

  // 1. MAC 검증
  const macKey = SVC_ID + sys_dttm + MAC_KEY;
  const expectedMac = crypto.createHmac('sha256', macKey).update('').digest('hex');
  if (expectedMac !== mac) {
    console.error('MAC 검증 실패', { trade_no });
    return res.status(400).send('MAC_VERIFY_FAIL');
  }

  // 2. 중복 처리 방어 (멱등성)
  const existing = await db.findPayment(trade_no);
  if (existing && existing.status === 'COMPLETED') {
    return res.status(200).send('OK'); // 이미 처리됨 — 200 반환하여 재시도 중지
  }

  // 3. 결제 결과 처리
  if (result_cd === '0000') {
    await db.updatePayment(trade_no, {
      status: 'COMPLETED',
      payNo: pay_no,
      payMethod: pay_method, // MC: 휴대폰, CN: 신용카드
      completedAt: sys_dttm,
    });
    // 서비스 제공 로직
  } else {
    await db.updatePayment(trade_no, {
      status: 'FAILED',
      errorCode: result_cd,
      errorMsg: result_msg,
    });
  }

  // 4. HTTP 200 응답 (필수)
  res.status(200).send('OK');
});
```

### Java (Spring Boot)

```java
@RestController
public class NezoCallbackController {
    @Value("${nezo.svc-id}") private String svcId;
    @Value("${nezo.mac-key}") private String macKey;

    @PostMapping("/pay/callback")
    public ResponseEntity<String> handleCallback(@RequestParam Map<String, String> params) {
        String resultCd = params.get("result_cd");
        String tradeNo = params.get("trade_no");
        String payNo = params.get("pay_no");
        String sysDttm = params.get("sys_dttm");
        String mac = params.get("mac");

        // MAC 검증
        String expectedMac = generateMac(svcId, sysDttm, macKey);
        if (!expectedMac.equals(mac)) {
            return ResponseEntity.badRequest().body("MAC_VERIFY_FAIL");
        }

        // 중복 처리 방어
        if (paymentService.isAlreadyProcessed(tradeNo)) {
            return ResponseEntity.ok("OK");
        }

        // 결제 결과 처리
        if ("0000".equals(resultCd)) {
            paymentService.completePayment(tradeNo, payNo);
        }

        return ResponseEntity.ok("OK");
    }
}
```

## 주의사항

- Callback URL은 반드시 **완전한 URL 형식**으로 지정 (예: `https://example.com/pay/callback`)
- HTTP 200 응답을 반환하지 않으면 재시도가 발생하므로 반드시 200 반환
- `trade_no` 기반으로 중복 처리 방어 로직(멱등성)을 구현해야 합니다
- `auto_bill_key`와 `user_key`는 자동결제 서비스 이용 시에만 응답됩니다
