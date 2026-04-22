# 결제 조회 API

결제 요청 건의 상태를 조회하는 API입니다.

## 기본 정보

| 항목 | 값 |
|------|-----|
| **엔드포인트** | `/send/view` |
| **HTTP Method** | POST |
| **Content-Type** | application/x-www-form-urlencoded |
| **테스트 URL** | `https://test.mpps.co.kr/buy4me/send/view` |
| **운영 URL** | `https://www.nezo.co.kr/send/view` |

## 요청 파라미터

| 파라미터 | 길이 | 필수 | MAC | 설명 |
|---------|------|------|-----|------|
| `svc_id` | 32 | O | O | KG파이낸셜에서 부여하는 서비스 아이디 |
| `trade_no` | 50 | O | O | 가맹점 거래번호 (결제 요청 시 사용한 값) |
| `send_id` | 50 | O | - | 결제 요청자 식별값 |
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
| `recv_hp` | 결제 수신자 전화번호 |
| `send_id` | 결제 요청자 아이디 |
| `item_id` | 상품 아이디 |
| `item_price` | 상품 가격 |
| `sys_dttm` | 처리 일시 (YYYYMMDDHHMISS) |
| `pay_no` | KG파이낸셜 결제 번호 |
| `pay_method` | 결제 구분. `MC`: 휴대폰, `CN`: 신용카드 |
| `cancel_yn` | 결제 취소 여부. `Y`: 취소됨, `N`: 정상 |
| `cancel_dttm` | 취소 일시 (취소하지 않았으면 NULL) |
| `link_url` | 결제창 URL (알림톡 미발송 및 미결제 상태일 때만 반환) |
| `mac` | 응답 MAC 검증값 |

### 응답 MAC 검증

```
MAC KEY = svc_id + sys_dttm + 별도제공KEY
```

## 요청 예시

```
POST /send/view HTTP/1.1
Host: test.mpps.co.kr/buy4me
Content-Type: application/x-www-form-urlencoded

svc_id=000110012345
&trade_no=20181030151548
&send_id=testuser
&send_dttm=20181030160000
&mac=a1b2c3d4...
```

## 응답 예시

### 결제 완료 상태
```json
{
    "result_cd": "0000",
    "result_msg": "성공",
    "svc_id": "000110012345",
    "trade_no": "20181030151548",
    "recv_hp": "01099991111",
    "send_id": "testuser",
    "item_id": "ITEM001",
    "item_price": "1000",
    "sys_dttm": "20181030151543",
    "pay_no": "8962271615",
    "pay_method": "MC",
    "cancel_yn": "N",
    "cancel_dttm": null,
    "mac": "e5f6a7b8..."
}
```

### 결제 취소 상태
```json
{
    "result_cd": "0000",
    "result_msg": "성공",
    "svc_id": "000110012345",
    "trade_no": "20181030151548",
    "pay_no": "8962271615",
    "pay_method": "MC",
    "cancel_yn": "Y",
    "cancel_dttm": "20181030170000",
    "mac": "e5f6a7b8..."
}
```

### 미결제 상태 (link_url 반환)
```json
{
    "result_cd": "0000",
    "result_msg": "성공",
    "svc_id": "000110012345",
    "trade_no": "20181030151548",
    "link_url": "https://test.mpps.co.kr/buy4me/pay?token=abc123",
    "cancel_yn": "N",
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

async function searchPayment(tradeNo) {
  const sendDttm = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const macKey = SVC_ID + sendDttm + MAC_KEY;
  const mac = crypto.createHmac('sha256', macKey).update('').digest('hex');

  const params = new URLSearchParams({
    svc_id: SVC_ID,
    trade_no: tradeNo,
    send_id: 'system',
    send_dttm: sendDttm,
    mac: mac,
  });

  const response = await axios.post(`${BASE_URL}/send/view`, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  const data = response.data;

  // 결제 상태 판단
  if (data.result_cd === '0000') {
    if (data.cancel_yn === 'Y') {
      return { status: 'CANCELLED', cancelDttm: data.cancel_dttm, ...data };
    } else if (data.link_url) {
      return { status: 'PENDING', linkUrl: data.link_url, ...data };
    } else {
      return { status: 'COMPLETED', payNo: data.pay_no, ...data };
    }
  }

  return { status: 'ERROR', ...data };
}
```

## 주의사항

- `link_url`이 응답에 포함되면 아직 결제가 완료되지 않은 상태입니다
- `cancel_yn`이 `Y`이면 취소된 거래이며, `cancel_dttm`에 취소 시각이 포함됩니다
- 조회 시에도 MAC 생성 및 응답 MAC 검증이 필요합니다
