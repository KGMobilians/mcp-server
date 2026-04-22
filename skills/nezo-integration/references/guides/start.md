# 시작하기

## 서비스 개요

내죠여왕(NEZO)은 **카카오 알림톡을 이용한 결제 요청 서비스**입니다. 가맹점이 API를 호출하면 고객에게 카카오 알림톡으로 결제 링크가 발송되고, 고객이 링크를 통해 결제를 완료하는 방식입니다.

## 접속 정보

| 환경 | URL |
|------|-----|
| **테스트 서버** | `https://test.mpps.co.kr/buy4me` |
| **운영 서버** | `https://www.nezo.co.kr` |

## API 기술 사양

- **프로토콜**: HTTPS
- **HTTP 메서드**: POST
- **인코딩**: UTF-8
- **응답 형식**: JSON (HTTP 200 OK)
- **성공 판단**: HTTP Body 내 `result_cd`와 `result_msg` 값으로 확인

## API 전문 목록

| API | 엔드포인트 | 설명 |
|-----|-----------|------|
| 결제 요청 | `/send` | 고객에게 알림톡 결제 요청 발송 |
| 결제 조회 | `/send/view` | 결제 상태 조회 |
| 결제 취소 | `/cancel` | 결제 취소 처리 |
| 결제 재요청 | (재전송) | 알림톡 결제 재요청 |

## MAC(메시지 인증 코드)

데이터 무결성을 위해 모든 API 요청/응답에 MAC 값을 포함합니다.

### MAC 생성 규칙

- **알고리즘**: HmacSHA256
- **결과**: 64자리 16진수(hex) 문자열

#### 요청 전문 MAC KEY 구성
```
KEY = 서비스아이디(svc_id) + 요청일시(send_dttm) + 별도제공KEY(MAC_KEY)
```

#### 응답 전문 MAC KEY 구성
```
KEY = 서비스아이디(svc_id) + 처리일시(sys_dttm) + 별도제공KEY(MAC_KEY)
```

### MAC 생성 예제 (Node.js)

```javascript
const crypto = require('crypto');

function generateMac(svcId, dttm, macKey) {
  const key = svcId + dttm + macKey;
  return crypto.createHmac('sha256', key)
    .update('')
    .digest('hex');
}

// 요청 MAC
const requestMac = generateMac(svcId, sendDttm, MAC_KEY);

// 응답 MAC 검증
const expectedMac = generateMac(svcId, sysDttm, MAC_KEY);
if (expectedMac !== responseMac) {
  throw new Error('MAC 검증 실패 - 데이터 위변조 가능성');
}
```

### MAC 생성 예제 (Java)

```java
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public static String generateMac(String svcId, String dttm, String macKey) throws Exception {
    String key = svcId + dttm + macKey;
    Mac mac = Mac.getInstance("HmacSHA256");
    SecretKeySpec secretKey = new SecretKeySpec(key.getBytes("UTF-8"), "HmacSHA256");
    mac.init(secretKey);
    byte[] hash = mac.doFinal("".getBytes("UTF-8"));
    StringBuilder hexString = new StringBuilder();
    for (byte b : hash) {
        String hex = Integer.toHexString(0xff & b);
        if (hex.length() == 1) hexString.append('0');
        hexString.append(hex);
    }
    return hexString.toString();
}
```

### MAC 생성 예제 (Python)

```python
import hmac
import hashlib

def generate_mac(svc_id: str, dttm: str, mac_key: str) -> str:
    key = svc_id + dttm + mac_key
    return hmac.new(
        key.encode('utf-8'),
        b'',
        hashlib.sha256
    ).hexdigest()
```

### MAC 생성 예제 (PHP)

```php
function generateMac($svcId, $dttm, $macKey) {
    $key = $svcId . $dttm . $macKey;
    return hash_hmac('sha256', '', $key);
}
```

## 제약사항

- **전문 유효 시간**: 10분 (초과 시 오류 응답)
- **callback_url 형식**: 완전한 URL 형식 필요 (예: `https://xxx.xxxx.com/pay/callback.do`)
- **trade_no**: 매 요청마다 바뀌는 가맹점 측의 unique 값

## 보안 규칙

1. `svc_id`와 `MAC_KEY`는 절대 클라이언트(프론트엔드) 코드에 포함 금지. 환경변수에서 로드
2. MAC 생성/검증은 반드시 서버 사이드에서 처리
3. 결제 요청/조회/취소 API는 반드시 백엔드에서 호출
4. `callback_url` 핸들러에서 `trade_no` 기반 중복 처리 방어(멱등성) 필수
5. 테스트 환경과 운영 환경 서버 URL을 환경변수로 분리 관리
