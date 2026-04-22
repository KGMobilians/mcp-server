# 결제 요청 API

가맹점이 고객에게 카카오 알림톡으로 결제를 요청하는 API입니다.

## 기본 정보

| 항목 | 값 |
|------|-----|
| **엔드포인트** | `/send` |
| **HTTP Method** | POST |
| **Content-Type** | application/x-www-form-urlencoded |
| **테스트 URL** | `https://test.mpps.co.kr/buy4me/send` |
| **운영 URL** | `https://www.nezo.co.kr/send` |

## 요청 파라미터

| 파라미터 | 길이 | 필수 | MAC | 설명 |
|---------|------|------|-----|------|
| `svc_id` | 32 | O | O | KG파이낸셜에서 부여하는 서비스 아이디 |
| `trade_no` | 50 | O | O | 가맹점 거래번호. 매 요청마다 바뀌는 unique 값 |
| `recv_hp` | 11 | O | - | 결제 수신자 전화번호 (하이픈 없이) |
| `send_id` | 50 | O | - | 결제 요청자 식별값 |
| `send_hp` | 11 | O | - | 결제 요청자 전화번호 |
| `item_id` | 50 | O | - | 상품 아이디 |
| `item_price` | 6 | O | - | 상품 가격 (원 단위) |
| `item_nm` | 50 | O | - | 상품명 |
| `send_dttm` | 14 | O | O | 요청 일시 (YYYYMMDDHHMISS) |
| `callback_url` | 150 | O | - | 결제 완료 후 결과 수신 URL |
| `mac` | 64 | O | - | MAC 검증값 (HmacSHA256) |
| `return_url` | 200 | - | - | 결제 결과 처리 화면 URL. 설정 시 KG파이낸셜 기본 화면 대신 가맹점 화면 표시 |
| `send_msg_yn` | 1 | - | - | 알림톡 발송 여부 (Y/N). N 설정 시 link_url 응답 |
| `valid_en_dt` | 8 | - | - | 결제 가능 유효일자 (YYYYMMDD) |
| `taxat_amt` | 6 | - | - | 과세금액 |

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
| `sys_dttm` | 처리 일시 (YYYYMMDDHHMISS) |
| `link_url` | 결제창 URL. `send_msg_yn=N` 설정 시에만 응답 |
| `mac` | 응답 MAC 검증값 |

### 응답 MAC 검증

```
MAC KEY = svc_id + sys_dttm + 별도제공KEY
```

## 요청 예시

```
POST /send HTTP/1.1
Host: test.mpps.co.kr/buy4me
Content-Type: application/x-www-form-urlencoded

svc_id=000110012345
&trade_no=20181030151548
&recv_hp=01099991111
&send_id=testuser
&send_hp=01088881234
&item_id=ITEM001
&item_price=1000
&item_nm=테스트 아이템01
&send_dttm=20181030151548
&callback_url=https://example.com/pay/callback
&mac=a1b2c3d4...
```

## 응답 예시

### 성공 (알림톡 발송)
```json
{
    "result_cd": "0000",
    "result_msg": "성공",
    "svc_id": "000110012345",
    "trade_no": "20181030151548",
    "sys_dttm": "20181030151543",
    "mac": "e5f6a7b8..."
}
```

### 성공 (send_msg_yn=N, 링크 URL 반환)
```json
{
    "result_cd": "0000",
    "result_msg": "성공",
    "svc_id": "000110012345",
    "trade_no": "20181030151548",
    "sys_dttm": "20181030151543",
    "link_url": "https://test.mpps.co.kr/buy4me/pay?token=abc123",
    "mac": "e5f6a7b8..."
}
```

## 구현 예제

### Node.js (Express)

```javascript
const crypto = require('crypto');
const axios = require('axios');

const SVC_ID = process.env.NEZO_SVC_ID;
const MAC_KEY = process.env.NEZO_MAC_KEY;
const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://www.nezo.co.kr'
  : 'https://test.mpps.co.kr/buy4me';

async function sendPaymentRequest({ recvHp, itemPrice, itemNm, callbackUrl, tradeNo }) {
  const sendDttm = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const macKey = SVC_ID + sendDttm + MAC_KEY;
  const mac = crypto.createHmac('sha256', macKey).update('').digest('hex');

  const params = new URLSearchParams({
    svc_id: SVC_ID,
    trade_no: tradeNo,
    recv_hp: recvHp,
    send_id: 'system',
    send_hp: '01000000000',
    item_id: 'ITEM001',
    item_price: String(itemPrice),
    item_nm: itemNm,
    send_dttm: sendDttm,
    callback_url: callbackUrl,
    mac: mac,
  });

  const response = await axios.post(`${BASE_URL}/send`, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  // 응답 MAC 검증
  const resMacKey = SVC_ID + response.data.sys_dttm + MAC_KEY;
  const expectedMac = crypto.createHmac('sha256', resMacKey).update('').digest('hex');
  if (expectedMac !== response.data.mac) {
    throw new Error('응답 MAC 검증 실패');
  }

  return response.data;
}
```

### Java (Spring Boot)

```java
@Service
public class NezoPaymentService {
    @Value("${nezo.svc-id}") private String svcId;
    @Value("${nezo.mac-key}") private String macKey;
    @Value("${nezo.base-url}") private String baseUrl;

    public Map<String, String> sendPaymentRequest(String recvHp, int itemPrice, String itemNm, String callbackUrl) throws Exception {
        String tradeNo = UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        String sendDttm = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String mac = generateMac(svcId, sendDttm, macKey);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("svc_id", svcId);
        params.add("trade_no", tradeNo);
        params.add("recv_hp", recvHp);
        params.add("item_price", String.valueOf(itemPrice));
        params.add("item_nm", itemNm);
        params.add("send_dttm", sendDttm);
        params.add("callback_url", callbackUrl);
        params.add("mac", mac);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> response = restTemplate.postForEntity(baseUrl + "/send", params, Map.class);
        return response.getBody();
    }
}
```
