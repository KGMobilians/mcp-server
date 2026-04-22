# HMAC 무결성 검증

MOBILPAY는 HMAC-SHA256 알고리즘을 사용하여 거래 데이터의 무결성을 검증합니다. 거래등록, 결제 인증/승인, 결제 취소 시 HMAC 값을 비교하여 데이터가 변조되지 않았는지 확인합니다.

> **보안 주의**: `skey`는 HMAC 계산에 사용되는 비밀키입니다. 절대 클라이언트(프론트엔드) 코드에 포함하지 마세요. 서버 사이드에서만 사용하며, 환경변수 또는 안전한 설정 파일에서 로드해야 합니다.

## 기본 사항

| 항목 | 값 |
|------|-----|
| **key** | `skey` (계약 시 별도 전달) |
| **algorithm** | `Base64encode(HMAC_SHA256(key, message))` |

## 용도별 메시지 구성

HMAC 메시지는 용도에 따라 구성이 다릅니다.

| 용도 | message 구성 | 비고 |
|------|-------------|------|
| 거래등록 / 결제 인증 / 결제 승인 | `amount(total)` + `ok_url` + `trade_id` + `time_stamp` | `time_stamp`는 거래등록 응답의 값 사용 |
| 결제 취소 | `amount` + `pay_token` | 취소 HMAC은 구성이 다름에 주의 |

### time_stamp 사용 규칙

- 거래등록 시 `time_stamp`를 세팅한 경우: 세팅한 값을 HMAC 메시지에 사용
- 거래등록 시 `time_stamp`를 미세팅한 경우: 거래등록 응답에서 반환된 `time_stamp` 값을 사용

## 구현 예제 - Java

```java
import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.apache.commons.codec.binary.Base64;

public class MobilpayHmac {

    public static void main(String[] args) throws Exception {
        // 거래등록/승인 HMAC 계산
        String skey = "YOUR_SKEY"; // 환경변수에서 로드할 것
        String amount = "1000";
        String okUrl = "https://www.example.com/payment/result";
        String tradeId = "ORDER_20250704_001";
        String timeStamp = "20250704120000";

        String registrationMessage = amount + okUrl + tradeId + timeStamp;
        System.out.println("거래등록 HMAC: " + hmacDigest(skey, registrationMessage));

        // 취소 HMAC 계산
        String payToken = "1904258548577654668";
        String cancelMessage = amount + payToken;
        System.out.println("취소 HMAC: " + hmacDigest(skey, cancelMessage));
    }

    public static String hmacDigest(String key, String msg) {
        String digest = null;
        String algorithm = "HmacSHA256";
        try {
            SecretKeySpec hmac_key = new SecretKeySpec(
                key.getBytes("UTF-8"), algorithm);
            Mac mac = Mac.getInstance(algorithm);
            mac.init(hmac_key);
            byte[] bytes = Base64.encodeBase64(
                mac.doFinal(msg.getBytes("UTF-8")));
            digest = new String(bytes);
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (InvalidKeyException e) {
            e.printStackTrace();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        return digest;
    }
}
```

## 구현 예제 - .NET (C#)

```csharp
using System;
using System.Text;
using System.Security.Cryptography;

namespace MobilpayHmac {
    class Hmac {
        public static void Main(string[] args) {
            string skey = "YOUR_SKEY"; // 환경변수에서 로드할 것
            string amount = "1000";
            string okUrl = "https://www.example.com/payment/result";
            string tradeId = "ORDER_20250704_001";
            string timeStamp = "20250704120000";

            // 거래등록/승인 HMAC
            string regMessage = amount + okUrl + tradeId + timeStamp;
            Console.WriteLine("거래등록 HMAC: " + HmacDigest(skey, regMessage));

            // 취소 HMAC
            string payToken = "1904258548577654668";
            string cancelMessage = amount + payToken;
            Console.WriteLine("취소 HMAC: " + HmacDigest(skey, cancelMessage));
        }

        public static string HmacDigest(string key, string msg) {
            var hmac_key = Encoding.UTF8.GetBytes(key);
            using (HMACSHA256 sha = new HMACSHA256(hmac_key)) {
                var bytes = Encoding.UTF8.GetBytes(msg);
                var hash = sha.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }
    }
}
```

## 구현 예제 - Node.js

```javascript
const crypto = require('crypto');

const SKEY = process.env.MOBILPAY_SKEY; // 반드시 환경변수에서 로드

// 거래등록/승인 HMAC 계산
function calculateRegistrationHmac(amount, okUrl, tradeId, timeStamp) {
  const message = String(amount) + okUrl + tradeId + timeStamp;
  return crypto.createHmac('sha256', SKEY)
    .update(message, 'utf8').digest('base64');
}

// 취소 HMAC 계산
function calculateCancelHmac(amount, payToken) {
  const message = String(amount) + String(payToken);
  return crypto.createHmac('sha256', SKEY)
    .update(message, 'utf8').digest('base64');
}

// HMAC 검증
function verifyHmac(receivedHmac, calculatedHmac) {
  return receivedHmac === calculatedHmac;
}
```

## 구현 예제 - Python

```python
import hmac
import hashlib
import base64
import os

SKEY = os.environ.get('MOBILPAY_SKEY')  # 반드시 환경변수에서 로드

def calculate_registration_hmac(amount, ok_url, trade_id, time_stamp):
    """거래등록/승인 HMAC 계산"""
    message = str(amount) + ok_url + trade_id + time_stamp
    h = hmac.new(SKEY.encode('utf-8'), message.encode('utf-8'), hashlib.sha256)
    return base64.b64encode(h.digest()).decode('utf-8')

def calculate_cancel_hmac(amount, pay_token):
    """취소 HMAC 계산"""
    message = str(amount) + str(pay_token)
    h = hmac.new(SKEY.encode('utf-8'), message.encode('utf-8'), hashlib.sha256)
    return base64.b64encode(h.digest()).decode('utf-8')
```

## 구현 예제 - PHP

```php
<?php
$skey = getenv('MOBILPAY_SKEY'); // 반드시 환경변수에서 로드

// 거래등록/승인 HMAC 계산
function calculateRegistrationHmac($amount, $okUrl, $tradeId, $timeStamp) {
    global $skey;
    $message = $amount . $okUrl . $tradeId . $timeStamp;
    return base64_encode(hash_hmac('sha256', $message, $skey, true));
}

// 취소 HMAC 계산
function calculateCancelHmac($amount, $payToken) {
    global $skey;
    $message = $amount . $payToken;
    return base64_encode(hash_hmac('sha256', $message, $skey, true));
}
?>
```

## HMAC 검증 실패 시 대처

응답의 `hmac` 값과 직접 계산한 HMAC 값이 일치하지 않는 경우:

1. `skey` 값이 정확한지 확인 (별도 전달받은 값)
2. 메시지 구성 순서가 올바른지 확인 (거래등록: `amount+ok_url+trade_id+time_stamp`, 취소: `amount+pay_token`)
3. `time_stamp` 값이 정확한지 확인 (거래등록 응답의 `time_stamp` 사용)
4. 인코딩이 UTF-8인지 확인
5. 에러코드 `6102`("유효하지 않은 hmac")가 반환되면 위 항목을 재점검
