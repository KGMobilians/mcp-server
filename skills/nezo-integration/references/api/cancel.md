# 결제 취소 API

완료된 결제 건을 취소하는 API입니다.

## 기본 정보

| 항목 | 값 |
|------|-----|
| **엔드포인트** | `/cancel` |
| **HTTP Method** | POST |
| **Content-Type** | application/x-www-form-urlencoded |
| **테스트 URL** | `https://test.mpps.co.kr/buy4me/cancel` |
| **운영 URL** | `https://www.nezo.co.kr/cancel` |

## 요청 파라미터

| 파라미터 | 길이 | 필수 | MAC | 설명 |
|---------|------|------|-----|------|
| `svc_id` | 32 | O | O | KG파이낸셜에서 부여하는 서비스 아이디 |
| `trade_no` | 50 | O | O | 가맹점 거래번호 (결제 요청 시 사용한 값) |
| `pay_no` | 20 | O | O | KG파이낸셜 결제 번호 (결제 완료 시 발급된 값) |
| `send_dttm` | 14 | O | O | 요청 일시 (YYYYMMDDHHMISS) |
| `mac` | 64 | O | - | MAC 검증값 |

### MAC 생성

```
MAC KEY = svc_id + send_dttm + 별도제공KEY
```

## 응답 파라미터

| 파라미터 | 설명 |
|---------|------|
| `result_cd` | 결과 코드 (0000: 성공) |
| `result_msg` | 결과 메시지 |
| `svc_id` | 서비스 아이디 |
| `trade_no` | 가맹점 거래번호 |
| `pay_no` | KG파이낸셜 결제 번호 |
| `sys_dttm` | 처리 일시 (YYYYMMDDHHMISS) |
| `mac` | 응답 MAC 검증값 |

### 응답 MAC 검증

```
MAC KEY = svc_id + sys_dttm + 별도제공KEY
```

## 요청 예시

```
POST /cancel HTTP/1.1
Host: test.mpps.co.kr/buy4me
Content-Type: application/x-www-form-urlencoded

svc_id=000110012345
&trade_no=20181030151548
&pay_no=8962271615
&send_dttm=20181030170000
&mac=a1b2c3d4...
```

## 응답 예시

### 취소 성공
```json
{
    "result_cd": "0000",
    "result_msg": "성공",
    "svc_id": "000110012345",
    "trade_no": "20181030151548",
    "pay_no": "8962271615",
    "sys_dttm": "20181030170005",
    "mac": "e5f6a7b8..."
}
```

### 취소 실패
```json
{
    "result_cd": "8001",
    "result_msg": "이미 취소된 거래입니다",
    "svc_id": "000110012345",
    "trade_no": "20181030151548",
    "pay_no": "8962271615",
    "sys_dttm": "20181030170005",
    "mac": "e5f6a7b8..."
}
```

## 구현 예제

### Node.js

```javascript
const crypto = require('crypto');
const axios = require('axios');

const SVC_ID = process.env.NEZO_SVC_ID;
const MAC_KEY = process.env.NEZO_MAC_KEY;
const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://www.nezo.co.kr'
  : 'https://test.mpps.co.kr/buy4me';

async function cancelPayment(tradeNo, payNo) {
  const sendDttm = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const macKey = SVC_ID + sendDttm + MAC_KEY;
  const mac = crypto.createHmac('sha256', macKey).update('').digest('hex');

  const params = new URLSearchParams({
    svc_id: SVC_ID,
    trade_no: tradeNo,
    pay_no: payNo,
    send_dttm: sendDttm,
    mac: mac,
  });

  const response = await axios.post(`${BASE_URL}/cancel`, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  const data = response.data;

  // 응답 MAC 검증
  const resMacKey = SVC_ID + data.sys_dttm + MAC_KEY;
  const expectedMac = crypto.createHmac('sha256', resMacKey).update('').digest('hex');
  if (expectedMac !== data.mac) {
    throw new Error('응답 MAC 검증 실패');
  }

  if (data.result_cd !== '0000') {
    throw new Error(`결제 취소 실패: [${data.result_cd}] ${data.result_msg}`);
  }

  return data;
}
```

### Java (Spring Boot)

```java
public Map<String, String> cancelPayment(String tradeNo, String payNo) throws Exception {
    String sendDttm = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    String mac = generateMac(svcId, sendDttm, macKey);

    MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
    params.add("svc_id", svcId);
    params.add("trade_no", tradeNo);
    params.add("pay_no", payNo);
    params.add("send_dttm", sendDttm);
    params.add("mac", mac);

    RestTemplate restTemplate = new RestTemplate();
    ResponseEntity<Map> response = restTemplate.postForEntity(baseUrl + "/cancel", params, Map.class);

    Map<String, String> data = response.getBody();
    if (!"0000".equals(data.get("result_cd"))) {
        throw new RuntimeException("결제 취소 실패: " + data.get("result_msg"));
    }

    return data;
}
```

## 주의사항

- `trade_no`와 `pay_no` 모두 필수입니다. 결제 완료 시 콜백으로 전달받은 `pay_no`를 저장해두어야 합니다
- 이미 취소된 거래를 다시 취소하면 에러 응답이 반환됩니다
- 취소 요청 전 결제 조회 API로 현재 상태를 확인하는 것을 권장합니다
