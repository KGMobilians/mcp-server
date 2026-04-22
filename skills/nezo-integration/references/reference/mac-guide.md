# MAC 생성/검증 가이드

내죠여왕 API에서 사용하는 MAC(Message Authentication Code) 생성 및 검증 방법을 안내합니다.

## 개요

내죠여왕 서비스는 주고받는 데이터의 위변조 검증을 위해 데이터인증값(mac)을 생성하고 검증합니다.

- **알고리즘**: HmacSHA256
- **생성 방식**: `HmacSHA256(DATA, KEY)`의 결과를 HexString으로 변환 후 **upperCase**하여 생성
- **결과 형식**: 64자리 대문자 16진수(HEX) 문자열
- **용도**: 요청/응답 데이터의 위변조 방지

## MAC KEY 구성

해시 Key는 서비스ID + 요청일시(yyyyMMddHHmmss) + 비밀키(별도제공)을 모두 합한 문자열입니다.

### 요청 전문 (가맹점 → 내죠여왕)
```
KEY = svc_id + send_dttm + 비밀키(별도제공)
MAC = toUpperCase(toHexString(HmacSHA256(DATA, KEY)))
```

### 응답 전문 (내죠여왕 → 가맹점)
```
KEY = svc_id + sys_dttm + 비밀키(별도제공)
MAC = toUpperCase(toHexString(HmacSHA256(DATA, KEY)))
```

### KEY 구성 요소

| 요소 | 설명 | 예시 |
|------|------|------|
| `svc_id` | KG파이낸셜에서 부여한 서비스 아이디 | `000110012345` |
| `send_dttm` | 요청 일시 (yyyyMMddHHmmss) | `20181030151548` |
| `sys_dttm` | 처리 일시 (yyyyMMddHHmmss) | `20181030151543` |
| 비밀키 | KG파이낸셜에서 별도 제공하는 비밀키 | (서비스 계약 시 제공) |

## 언어별 구현 예제

### Java

```java
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.xml.bind.DatatypeConverter;
import java.nio.charset.Charset;

public class HMACUtil {
    /**
     * MAC 생성
     * @param data       해싱할 데이터
     * @param serviceId  서비스 아이디
     * @param sendDttm   일시 (요청: send_dttm, 응답: sys_dttm) yyyyMMddHHmmss 포맷
     * @param secretKey  별도 제공 비밀키
     * @return 64자리 대문자 HEX 문자열
     */
    public static String HMAC_SHA256(String data, String serviceId, String sendDttm, String secretKey) throws Exception {
        String key = serviceId + sendDttm + secretKey;
        String alg = "HmacSHA256";
        Mac hmac = Mac.getInstance(alg);
        hmac.init(new SecretKeySpec(key.getBytes(Charset.forName("UTF-8")), alg));
        hmac.update(data.getBytes());
        byte[] hash = hmac.doFinal();
        return DatatypeConverter.printHexBinary(hash).toUpperCase();
    }

    /**
     * 응답 MAC 검증
     */
    public static boolean verifyMac(String data, String serviceId, String sysDttm, String secretKey, String receivedMac) throws Exception {
        String expectedMac = HMAC_SHA256(data, serviceId, sysDttm, secretKey);
        return expectedMac.equals(receivedMac);
    }
}
```

### C# (.NET)

```csharp
using System.Security.Cryptography;
using System.Text;

public class HMACUtil
{
    /// <summary>
    /// MAC 생성 — 결과는 64자리 대문자 HEX 문자열
    /// </summary>
    public static string HMAC_SHA256(string data, string serviceId, string dttm, string secretKey)
    {
        string key = serviceId + dttm + secretKey;
        using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key)))
        {
            byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return BitConverter.ToString(hash).Replace("-", "").ToUpper();
        }
    }

    public static bool VerifyMac(string data, string serviceId, string sysDttm, string secretKey, string receivedMac)
    {
        string expectedMac = HMAC_SHA256(data, serviceId, sysDttm, secretKey);
        return expectedMac.Equals(receivedMac, StringComparison.OrdinalIgnoreCase);
    }
}
```

### Node.js

```javascript
const crypto = require('crypto');

/**
 * MAC 생성
 * @param {string} data       해싱할 데이터
 * @param {string} serviceId  서비스 아이디
 * @param {string} dttm       일시 (요청: send_dttm, 응답: sys_dttm)
 * @param {string} secretKey  별도 제공 비밀키
 * @returns {string} 64자리 대문자 HEX 문자열
 */
function hmacSha256(data, serviceId, dttm, secretKey) {
  const key = serviceId + dttm + secretKey;
  return crypto.createHmac('sha256', key)
    .update(data, 'utf8')
    .digest('hex')
    .toUpperCase();
}

/**
 * 응답 MAC 검증
 */
function verifyMac(data, serviceId, sysDttm, secretKey, receivedMac) {
  const expectedMac = hmacSha256(data, serviceId, sysDttm, secretKey);
  // timing-safe 비교로 타이밍 공격 방지
  return crypto.timingSafeEqual(
    Buffer.from(expectedMac, 'hex'),
    Buffer.from(receivedMac, 'hex')
  );
}

module.exports = { hmacSha256, verifyMac };
```

### Python

```python
import hmac
import hashlib

def hmac_sha256(data: str, service_id: str, dttm: str, secret_key: str) -> str:
    """MAC 생성 — 결과는 64자리 대문자 HEX 문자열"""
    key = service_id + dttm + secret_key
    return hmac.new(
        key.encode('utf-8'),
        data.encode('utf-8'),
        hashlib.sha256
    ).hexdigest().upper()

def verify_mac(data: str, service_id: str, sys_dttm: str, secret_key: str, received_mac: str) -> bool:
    """응답 MAC 검증"""
    expected_mac = hmac_sha256(data, service_id, sys_dttm, secret_key)
    return hmac.compare_digest(expected_mac, received_mac)
```

### PHP

```php
<?php
/**
 * MAC 생성 — 결과는 64자리 대문자 HEX 문자열
 */
function hmacSha256($data, $serviceId, $dttm, $secretKey) {
    $key = $serviceId . $dttm . $secretKey;
    return strtoupper(hash_hmac('sha256', $data, $key));
}

/**
 * 응답 MAC 검증
 */
function verifyMac($data, $serviceId, $sysDttm, $secretKey, $receivedMac) {
    $expectedMac = hmacSha256($data, $serviceId, $sysDttm, $secretKey);
    return hash_equals($expectedMac, $receivedMac);
}
?>
```

## MAC 검증 실패 시 대처

MAC 검증이 실패하는 경우 다음 항목을 확인하세요:

1. **KEY 구성 순서**: `서비스ID + 일시 + 비밀키` 순서가 맞는지 확인
2. **일시(dttm) 값**: 요청은 `send_dttm`, 응답은 `sys_dttm`을 사용하는지 확인
3. **비밀키**: KG파이낸셜에서 제공한 비밀키 값이 정확한지 확인
4. **DATA**: 해싱 대상 데이터가 올바른지 확인
5. **인코딩**: UTF-8 인코딩을 사용하는지 확인
6. **대소문자**: 결과가 대문자(upperCase) HEX 문자열인지 확인

## 보안 주의사항

- 비밀키는 절대 클라이언트(프론트엔드) 코드에 포함하지 마세요
- 비밀키는 환경변수(`NEZO_SECRET_KEY`)로 관리하세요
- MAC 생성/검증은 반드시 서버 사이드에서만 수행하세요
- 응답 MAC 검증 시 timing-safe 비교 함수를 사용하세요 (타이밍 공격 방지)
