# 결제 재요청 API

이미 요청한 결제 건에 대해 알림톡을 재발송하는 API입니다.

## 기본 정보

| 항목 | 값 |
|------|-----|
| **엔드포인트** | (재전송) |
| **HTTP Method** | POST |
| **Content-Type** | application/x-www-form-urlencoded |
| **테스트 URL** | `https://test.mpps.co.kr/buy4me` (재전송 엔드포인트) |
| **운영 URL** | `https://www.nezo.co.kr` (재전송 엔드포인트) |

## 요청 파라미터

| 파라미터 | 길이 | 필수 | MAC | 설명 |
|---------|------|------|-----|------|
| `svc_id` | 32 | O | O | KG파이낸셜에서 부여하는 서비스 아이디 |
| `trade_no` | 50 | O | O | 가맹점 거래번호. 매 요청마다 바뀌는 unique 값 |
| `send_dttm` | 14 | O | O | 재요청 시각 (YYYYMMDDHHMISS) |
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
| `sys_dttm` | 처리 일시 (YYYYMMDDHHMISS) |
| `mac` | 응답 MAC 검증값 |

### 응답 MAC 검증

```
MAC KEY = svc_id + sys_dttm + 별도제공KEY
```

## 요청 예시

```
POST (재전송 엔드포인트) HTTP/1.1
Host: test.mpps.co.kr/buy4me
Content-Type: application/x-www-form-urlencoded

svc_id=000110012345
&trade_no=20181030151548
&send_dttm=20181031100000
&mac=a1b2c3d4...
```

## 응답 예시

### 재요청 성공
```json
{
    "result_cd": "0000",
    "result_msg": "성공",
    "svc_id": "000110012345",
    "trade_no": "20181030151548",
    "sys_dttm": "20181031100005",
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

async function resendPayment(tradeNo) {
  const sendDttm = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const macKey = SVC_ID + sendDttm + MAC_KEY;
  const mac = crypto.createHmac('sha256', macKey).update('').digest('hex');

  const params = new URLSearchParams({
    svc_id: SVC_ID,
    trade_no: tradeNo,
    send_dttm: sendDttm,
    mac: mac,
  });

  const response = await axios.post(`${BASE_URL}/resend`, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (response.data.result_cd !== '0000') {
    throw new Error(`재요청 실패: [${response.data.result_cd}] ${response.data.result_msg}`);
  }

  return response.data;
}
```

## 주의사항

- 결제가 아직 완료되지 않은(미결제) 상태의 거래만 재요청 가능합니다
- 이미 결제 완료된 거래를 재요청하면 에러 응답이 반환됩니다
- 재요청 전 결제 조회 API로 현재 상태를 확인하는 것을 권장합니다
- `trade_no`는 매 요청마다 unique한 값이어야 합니다
