# 결제 창 호출

거래 등록 API(`/MUP/api/registration`)를 호출하여 응답받은 `pay_url` 또는 `qrcode_url`을 사용하여 MOBILPAY 결제 창을 호출합니다. 사용자는 이 결제 창에서 결제수단을 선택하고 인증을 진행합니다.

결제 창 호출은 두 가지 방식이 있습니다.

- **일반 호출**: `pay_url`을 팝업, self, iframe 방식으로 호출하여 결제 창을 표시
- **QRCode 호출**: `qrcode_url`을 사용하여 QR코드 이미지를 표시하고, 사용자가 모바일로 스캔하여 결제

## 결제 창 호출 (일반)

거래 등록 응답으로 받은 `pay_url`을 팝업 또는 iframe으로 호출하여 결제 창을 표시합니다.

- **HTTP Method**: GET 또는 POST
- **PATH**: `/MUP/api/payment.mcash`
- **운영서버**: `https://mup.mobilians.co.kr/MUP/api/payment.mcash`
- **테스트서버**: `https://test.mobilians.co.kr/MUP/api/payment.mcash`

### 요청 파라미터

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `tid` | string | 20 | Y | 거래등록 고유번호. 거래 등록 API 응답으로 받은 값 |
| `cash_code` | string | 2 | N | 결제수단 선택. 미전달 시 거래등록 시 설정한 `cash_code` 결제수단으로 호출. `MC`: 휴대폰, `CN`: 신용카드, `RA`: 실계좌이체, `VA`: 가상계좌 |

> **참고**: 일반적으로 `pay_url`에 `tid`가 이미 쿼리 파라미터로 포함되어 있으므로, `pay_url`을 그대로 호출하면 됩니다.

### 호출 방식별 구현

결제 창 호출 방식은 거래 등록 시 `call_type` 파라미터로 결정합니다.

| call_type | 방식 | 설명 |
|-----------|------|------|
| `P` (기본값) | popup | `window.open()`으로 새 창에서 결제 창을 표시 |
| `S` | self | 현재 페이지를 결제 창으로 전환 (location.href 방식) |
| `I` | iframe | iframe 태그 안에 결제 창을 표시 |

> **주의**: `call_type`이 `S`(self) 또는 `I`(iframe)인 경우 거래 등록 시 `close_url`을 반드시 세팅해야 합니다. 사용자가 취소 버튼을 클릭했을 때 이동할 URL입니다.

### 구현 예제 - Popup 방식 (JavaScript)

가장 일반적인 결제 창 호출 방식입니다. `window.open()`을 사용하여 새 창에서 결제 창을 엽니다.

```javascript
/**
 * MOBILPAY 결제 창 호출 - Popup 방식
 * 거래 등록 API 응답으로 받은 pay_url을 팝업으로 호출합니다.
 *
 * @param {string} payUrl - 거래 등록 API 응답의 pay_url 값
 */
function openPaymentWindow(payUrl) {
  // 신용카드 PC WEB 기준 결제 창 크기: 820 x 600
  var width = 820;
  var height = 600;
  var left = (screen.width - width) / 2;
  var top = (screen.height - height) / 2;

  var options = 'width=' + width + ',height=' + height
    + ',left=' + left + ',top=' + top
    + ',scrollbars=yes,resizable=yes';

  // submit 방식은 지양하세요. IE11에서 about:blank 새 창 문제가 발생할 수 있습니다.
  var paymentPopup = window.open(payUrl, 'mobilpay_payment', options);

  if (!paymentPopup || paymentPopup.closed) {
    alert('팝업이 차단되었습니다. 팝업 차단을 해제해 주세요.');
  }
}

// 사용 예시
// 거래 등록 API 호출 후 응답에서 pay_url을 받아 호출
fetch('https://mup.mobilians.co.kr/MUP/api/registration', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sid: '000730010001',
    cash_code: 'CN',
    product_name: '테스트상품',
    trade_id: 'ORDER_20250704_001',
    site_url: 'www.example.com',
    ok_url: 'https://www.example.com/payment/result',
    amount: { total: 10000 }
  })
})
.then(function(response) { return response.json(); })
.then(function(data) {
  if (data.code === '0000') {
    // 거래 등록 성공 → 결제 창 호출
    openPaymentWindow(data.pay_url);
  } else {
    alert('거래 등록 실패: ' + data.message);
  }
});
```

> **보안 주의**: 위 예제는 클라이언트 사이드에서 직접 거래 등록 API를 호출하는 코드이지만, 실제 운영 환경에서는 **반드시 서버 사이드에서 거래 등록 API를 호출**한 후 `pay_url`만 클라이언트로 전달해야 합니다. `skey`를 사용한 HMAC 검증은 서버 사이드에서 처리해야 하며, 클라이언트에 `skey`가 노출되면 안 됩니다.

### 구현 예제 - Self 방식 (JavaScript)

현재 페이지를 결제 창으로 전환합니다. 거래 등록 시 `call_type`을 `S`로 설정해야 합니다.

```javascript
/**
 * MOBILPAY 결제 창 호출 - Self 방식
 * 현재 페이지를 결제 창으로 전환합니다.
 * 거래 등록 시 call_type: "S", close_url 필수 세팅
 *
 * @param {string} payUrl - 거래 등록 API 응답의 pay_url 값
 */
function openPaymentSelf(payUrl) {
  window.location.href = payUrl;
}
```

### 구현 예제 - iframe 방식 (HTML + JavaScript)

iframe 태그 안에 결제 창을 표시합니다. 거래 등록 시 `call_type`을 `I`로 설정해야 합니다.

```html
<!-- 결제 창을 표시할 iframe -->
<!-- 휴대폰/계좌이체 기준: 390 x 613, 신용카드 기준: 820 x 600 -->
<iframe id="mobilpay_iframe"
  name="mobilpay_iframe"
  width="820"
  height="600"
  frameborder="0"
  scrolling="auto"
  style="border: none;">
</iframe>

<script>
/**
 * MOBILPAY 결제 창 호출 - iframe 방식
 * 거래 등록 시 call_type: "I", close_url 필수 세팅
 *
 * @param {string} payUrl - 거래 등록 API 응답의 pay_url 값
 */
function openPaymentIframe(payUrl) {
  document.getElementById('mobilpay_iframe').src = payUrl;
}
</script>
```

> **주의**: 네이버페이(`ep_code=NAV`)는 iframe 환경에서 지원되지 않습니다. 네이버페이 연동 시 `call_type`을 `P`(popup) 또는 `S`(self)로 설정해야 합니다.

### 구현 예제 - 서버 사이드 거래등록 + 클라이언트 결제창 호출 (권장 패턴)

실제 운영 환경에서 권장하는 전체 플로우 예제입니다. 서버에서 거래 등록을 처리하고, 클라이언트는 `pay_url`만 받아서 결제 창을 호출합니다.

```javascript
// === 서버 사이드 (Node.js/Express 예시) ===

const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json());

// skey는 반드시 환경변수에서 로드합니다. 절대 클라이언트에 노출하지 마세요.
const SKEY = process.env.MOBILPAY_SKEY;
const SID = process.env.MOBILPAY_SID;
const API_DOMAIN = process.env.NODE_ENV === 'production'
  ? 'https://mup.mobilians.co.kr'
  : 'https://test.mobilians.co.kr';

app.post('/api/payment/register', async (req, res) => {
  const { productName, amount, tradeId, cashCode } = req.body;

  // 거래 등록 API 호출
  const response = await fetch(API_DOMAIN + '/MUP/api/registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sid: SID,
      cash_code: cashCode || 'CN',
      product_name: productName,
      trade_id: tradeId,
      site_url: 'www.example.com',
      ok_url: 'https://www.example.com/payment/result',
      amount: { total: amount }
    })
  });

  const data = await response.json();

  if (data.code === '0000') {
    // HMAC 무결성 검증
    const message = String(amount) + 'https://www.example.com/payment/result'
      + tradeId + data.time_stamp;
    const hmac = crypto.createHmac('sha256', SKEY)
      .update(message, 'utf8').digest('base64');

    if (hmac !== data.hmac) {
      return res.status(400).json({ error: 'HMAC 검증 실패' });
    }

    // 클라이언트에 pay_url만 전달 (skey, sid 등 민감 정보 미포함)
    res.json({
      success: true,
      payUrl: data.pay_url,
      qrcodeUrl: data.qrcode_url,
      tid: data.tid
    });
  } else {
    res.status(400).json({ error: data.message, code: data.code });
  }
});
```

```javascript
// === 클라이언트 사이드 (JavaScript) ===

async function startPayment() {
  var response = await fetch('/api/payment/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productName: '테스트상품',
      amount: 10000,
      tradeId: 'ORDER_' + Date.now(),
      cashCode: 'CN'
    })
  });

  var data = await response.json();

  if (data.success) {
    // 서버에서 받은 pay_url로 결제 창 호출
    openPaymentWindow(data.payUrl);
  } else {
    alert('결제 준비 실패: ' + data.error);
  }
}
```

## 결제 창 호출 (QRCode)

QR코드 이미지를 표시하여 사용자가 모바일 기기로 스캔하고 결제할 수 있도록 합니다. 거래 등록 응답으로 받은 `qrcode_url`을 사용합니다.

- **HTTP Method**: GET 또는 POST
- **PATH**: `/MUP/api/qr-code.mcash`
- **운영서버**: `https://mup.mobilians.co.kr/MUP/api/qr-code.mcash`
- **테스트서버**: `https://test.mobilians.co.kr/MUP/api/qr-code.mcash`

### 요청 파라미터

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `tid` | string | 20 | Y | 거래등록 고유번호. 거래 등록 API 응답으로 받은 값 |
| `size` | number | 10 | N | QRCode 크기. 숫자만 입력 (단위: px). 미전달 시 기본 크기로 표시 |

### 구현 예제 - QRCode 표시 (HTML + JavaScript)

```html
<!-- QR코드를 표시할 영역 -->
<div id="qrcode_area" style="text-align: center; padding: 20px;">
  <p>아래 QR코드를 스캔하여 결제를 진행해 주세요.</p>
  <img id="qrcode_img" src="" alt="결제 QR코드" />
</div>

<script>
/**
 * MOBILPAY QRCode 결제 창 호출
 * 거래 등록 API 응답의 qrcode_url을 사용합니다.
 *
 * @param {string} qrcodeUrl - 거래 등록 API 응답의 qrcode_url 값
 * @param {number} [size=200] - QRCode 크기 (px)
 */
function showPaymentQRCode(qrcodeUrl, size) {
  var url = qrcodeUrl;
  if (size) {
    url += (url.indexOf('?') > -1 ? '&' : '?') + 'size=' + size;
  }
  document.getElementById('qrcode_img').src = url;
}

// 사용 예시 (서버에서 거래등록 후 qrcodeUrl을 전달받은 상태)
// showPaymentQRCode(data.qrcodeUrl, 250);
</script>
```

### 구현 예제 - iframe 안에 QRCode 표시

```html
<iframe id="qrcode_iframe"
  width="300"
  height="300"
  frameborder="0"
  style="border: none;">
</iframe>

<script>
function showPaymentQRCodeIframe(qrcodeUrl, size) {
  var url = qrcodeUrl;
  if (size) {
    url += (url.indexOf('?') > -1 ? '&' : '?') + 'size=' + size;
  }
  document.getElementById('qrcode_iframe').src = url;
}
</script>
```

## 결제 창 크기 규격

결제 창의 크기는 결제수단과 접속 환경에 따라 다릅니다. 팝업 또는 iframe으로 호출할 때 아래 크기를 적용해야 합니다.

| 환경 | 결제수단 | Width (px) | Height (px) | 비고 |
|------|----------|------------|-------------|------|
| PC WEB | 신용카드 | 820 | 600 | |
| PC WEB | 휴대폰, 계좌이체 | 390 | 613 | |
| MOBILE WEB | 전 결제수단 공통 | 320 (최소) | 500 (최소) | 스크롤 허용 필수 |

> **MOBILE WEB 주의**: 최소 크기는 320x500이며, 결제 창 내에서 스크롤이 가능해야 합니다. iframe 사용 시 `scrolling="auto"` 또는 CSS `overflow: auto`를 설정하세요.

### 결제수단별 결제 창 크기 적용 예제 (JavaScript)

```javascript
/**
 * 결제수단에 맞는 팝업 크기를 반환합니다.
 *
 * @param {string} cashCode - 결제수단 코드. MC: 휴대폰, CN: 신용카드, RA: 실계좌이체, VA: 가상계좌
 * @returns {{ width: number, height: number }}
 */
function getPaymentWindowSize(cashCode) {
  // 모바일 환경 감지
  var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    return { width: 320, height: 500 };
  }

  switch (cashCode) {
    case 'CN': // 신용카드
      return { width: 820, height: 600 };
    case 'MC': // 휴대폰
    case 'RA': // 실계좌이체
    case 'VA': // 가상계좌
    default:
      return { width: 390, height: 613 };
  }
}

/**
 * 결제수단에 맞는 크기로 결제 창을 팝업으로 엽니다.
 *
 * @param {string} payUrl - 거래 등록 API 응답의 pay_url 값
 * @param {string} cashCode - 결제수단 코드
 */
function openPaymentWindowAdaptive(payUrl, cashCode) {
  var size = getPaymentWindowSize(cashCode);
  var left = (screen.width - size.width) / 2;
  var top = (screen.height - size.height) / 2;

  var options = 'width=' + size.width + ',height=' + size.height
    + ',left=' + left + ',top=' + top
    + ',scrollbars=yes,resizable=yes';

  window.open(payUrl, 'mobilpay_payment', options);
}
```

## 결제 창 호출 후 결과 수신

결제 창에서 사용자가 결제를 완료(또는 실패/취소)하면, 거래 등록 시 설정한 URL로 결과가 전달됩니다.

| 결과 유형 | 전달 URL | 설명 |
|-----------|----------|------|
| 결제 성공 (일반결제) | `ok_url` | 승인 결과가 POST로 전달. `code=0000` 확인 후 서비스 제공 |
| 인증 성공 (하이브리드결제) | `ok_url` | 인증 결과가 POST로 전달. 이후 결제 승인 API를 별도 호출 필요 |
| 결제 실패 | `fail_url` | 결제 실패 결과가 전달. `fail_url` 미설정 시 `ok_url`로 전달 |
| 사용자 취소 | `close_url` | 사용자가 취소 버튼 클릭. `call_type`이 `S` 또는 `I`일 때 사용 |
| 결제 결과 노티 (시스템) | `noti_url` | 시스템 back단에서 결과를 최대 20회 반복 호출. 가상계좌 입금완료 통보 포함 |

### 결과 수신 포맷

- **Content-Type**: `text/html`
- **Charset**: `euc-kr`
- **Method**: POST

결과 수신 시 전달되는 파라미터 상세는 결제 인증(승인) 응답 문서(`auth-response.md`)를 참고하세요.

## 전체 결제 플로우에서의 위치

```
[1] 사용자 → 가맹점: 결제 요청
[2] 가맹점 서버 → MOBILPAY: 거래 등록 API 호출 (/MUP/api/registration)
[3] MOBILPAY → 가맹점 서버: pay_url, tid 응답
[4] 가맹점 서버 → 클라이언트: pay_url 전달
[5] 클라이언트: pay_url로 결제 창 호출 ← 현재 문서에서 다루는 단계
[6] 사용자: 결제 창에서 결제 진행
[7] MOBILPAY → 가맹점: ok_url로 결과 전달
    └─ 일반결제: 승인 결과 전달 → 서비스 제공
    └─ 하이브리드결제: 인증 결과 전달 → [8] 결제 승인 API 호출 필요
```

## 연동 시 주의사항

- **submit 방식 지양**: `pay_url` 호출 시 form submit 방식은 사용하지 마세요. IE11에서 about:blank 새 창 문제가 발생할 수 있습니다. `window.open()`, `location.href`, iframe `src` 할당 방식을 사용하세요.
- **네이버페이 iframe 제한**: 네이버페이(`ep_code=NAV`)는 iframe 환경에서 지원되지 않습니다. 네이버페이 결제가 포함된 경우 `call_type`을 `P`(popup) 또는 `S`(self)로 설정해야 합니다.
- **팝업 차단 대응**: 사용자 브라우저에서 팝업을 차단한 경우를 대비하여, 팝업 호출 실패 시 안내 메시지를 표시하는 로직을 추가하세요.
- **모바일 환경**: MOBILE WEB에서는 팝업보다 `call_type=S`(self 방식)을 권장합니다. 모바일 브라우저에서 팝업이 제한될 수 있습니다.
- **결제 창 크기**: 결제수단에 따라 결제 창 크기가 다릅니다. 신용카드 PC WEB은 820x600, 휴대폰/계좌이체 PC WEB은 390x613, MOBILE WEB은 최소 320x500(스크롤 허용 필수)입니다.
- **보안**: 거래 등록 API는 반드시 서버 사이드에서 호출하고, 클라이언트에는 `pay_url`만 전달하세요. `skey`, `sid` 등 민감 정보가 클라이언트 코드에 노출되면 안 됩니다.
