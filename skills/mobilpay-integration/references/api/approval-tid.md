# 결제 승인 - TID 방식

하이브리드 결제(`hybrid_pay=Y`)를 사용하는 경우, 결제 창에서 인증이 완료된 후 가맹점이 직접 결제 승인 API를 호출하여 최종 결제를 완료합니다. TID 방식은 거래등록 시 발급받은 `tid`를 기반으로 승인을 요청하는 방식입니다.

- **HTTP Method**: POST
- **Content-Type**: application/json
- **PATH**: `/MUP/api/approval`
- **운영서버**: `https://mup.mobilians.co.kr/MUP/api/approval`
- **테스트서버**: `https://test.mobilians.co.kr/MUP/api/approval`

> **보안 주의**: 결제 승인 API는 반드시 서버 사이드에서 호출해야 합니다. 클라이언트(프론트엔드)에서 직접 호출하면 안 됩니다.

## 요청 파라미터

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `sid` | string | 12 | Y | 가맹점 코드 |
| `tid` | string | 20 | Y | 거래등록 고유번호. 거래 등록 API 응답으로 받은 값 |
| `cash_code` | string | 2 | Y | 결제수단. `MC`: 휴대폰, `CN`: 신용카드, `RA`: 실계좌이체, `VA`: 가상계좌 |
| `pay_token` | string | 50 | Y | 결제 토큰. ok_url 인증 응답에서 받은 값 |
| `amount` | string | 10 | Y | 총 결제 금액 |

### 결제수단별 추가 필수 파라미터

| 결제수단 | 필드 | 필수 | 설명 |
|----------|------|------|------|
| 휴대폰 (MC) | `mc_user_key` | Y | 휴대폰정보 대체 키. 인증 응답에서 받은 값 |
| 실계좌이체 (RA) | `reference_key` | Y | 실계좌이체 참조 키. 인증 응답의 `ra_reference_key` 값 |
| 가상계좌 (VA) | `reference_key` | Y | 가상계좌 참조 키. 인증 응답의 `va_reference_key` 값 |

## 응답 파라미터

| 필드 | 타입 | 최대길이 | 설명 |
|------|------|----------|------|
| `code` | string | 4 | 응답 코드. `0000`: 성공 |
| `message` | string | 100 | 응답 메시지 |
| `sid` | string | 12 | 가맹점 코드 |
| `sign_date` | string | 14 | 승인시간 |
| `tid` | string | 20 | 거래등록 고유번호 |
| `trade_id` | string | 50 | 가맹점 거래번호 |
| `cash_code` | string | 2 | 결제수단 |
| `pay_token` | string | 20 | 결제 토큰 |
| `product_name` | string | 50 | 상품명 |
| `amount` | string | 10 | 총 결제 금액 |
| `hmac` | string | 44 | 무결성 검증용 hash |
| `transaction_id` | string | 32 | 트랜젝션ID. 휴대폰결제(`cash_code=MC`)만 지원 |

### 결제수단별 추가 응답 파라미터

**휴대폰 (MC)**: `mc_bill_key`(자동결제 키), `mc_user_key`(휴대폰정보 대체 키), `mc_simple_key`(간소화결제 키)

**신용카드 (CN)**: `cn_installment`(할부개월), `cn_card_no`(카드번호), `cn_card_code`(카드코드), `cn_card_name`(카드이름), `cn_appr_no`(승인번호), `cn_coupon_price`(쿠폰 사용 금액), `cn_pay_method`(지불 방법), `cn_own_cd`(카드소유구분), `cn_bill_yn`(현금영수증 발급여부)

**간편결제**: `ep_installment`, `ep_card_no`, `ep_card_code`, `ep_card_name`, `ep_appr_no`, `ep_coupon_price`, `ep_pay_method`, `ep_bill_yn`

**실계좌이체 (RA)**: `ra_bank_name`(은행명)

**가상계좌 (VA)**: `va_account_no`(가상 계좌번호), `va_bank_code`(은행코드), `va_rcptlimit_date`(입금 마감 일자), `va_acctlimit_date`(계좌 만기 일자)

## 요청 예제

```json
{
  "sid": "000730010001",
  "tid": "20190619160850826790",
  "cash_code": "MC",
  "pay_token": "1904258548577654668",
  "amount": "1000"
}
```

## 응답 예제

```json
{
  "code": "0000",
  "message": "정상처리",
  "sid": "000730010001",
  "tid": "20190619160850826790",
  "cash_code": "MC",
  "pay_token": "1904258548577654668",
  "amount": "1000",
  "hmac": "I3qi5h256KJKTbbKAlC9pXFiVaAgb/E2ci6ZgkjzVsg=",
  "transaction_id": "20230117MCNA4002165626A047216348"
}
```

## 구현 예제 (Node.js/Express)

```javascript
const crypto = require('crypto');
const SKEY = process.env.MOBILPAY_SKEY;
const SID = process.env.MOBILPAY_SID;
const API_DOMAIN = process.env.NODE_ENV === 'production'
  ? 'https://mup.mobilians.co.kr'
  : 'https://test.mobilians.co.kr';

// 하이브리드결제: 인증 결과 수신 후 승인 API 호출
app.post('/payment/auth-result', async (req, res) => {
  const { code, tid, cash_code, pay_token, amount, trade_id,
          mc_user_key, ra_reference_key, va_reference_key } = req.body;

  if (code !== '0000') {
    return res.redirect('/payment/fail?msg=' + encodeURIComponent(req.body.message));
  }

  // 결제 승인 API 호출 (서버 사이드에서 처리)
  const approvalBody = {
    sid: SID,
    tid: tid,
    cash_code: cash_code,
    pay_token: pay_token,
    amount: amount
  };

  // 결제수단별 추가 파라미터
  if (cash_code === 'MC' && mc_user_key) approvalBody.mc_user_key = mc_user_key;
  if ((cash_code === 'RA') && ra_reference_key) approvalBody.reference_key = ra_reference_key;
  if ((cash_code === 'VA') && va_reference_key) approvalBody.reference_key = va_reference_key;

  const response = await fetch(API_DOMAIN + '/MUP/api/approval', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(approvalBody)
  });
  const result = await response.json();

  if (result.code === '0000') {
    processPaymentSuccess(trade_id, pay_token, amount, cash_code);
    res.redirect('/payment/success?trade_id=' + trade_id);
  } else {
    res.redirect('/payment/fail?msg=' + encodeURIComponent(result.message));
  }
});
```

## 연동 시 주의사항

- 결제 승인 API는 **반드시 서버 사이드**에서 호출하세요. 클라이언트에서 호출하면 `skey` 등 민감 정보가 노출될 수 있습니다.
- 인증 응답(`ok_url`)에서 `code=0000`을 확인한 후에만 승인 API를 호출하세요.
- 승인 응답의 `hmac`을 반드시 검증하세요.
- 승인 API 호출 시 타임아웃이 발생한 경우, 거래 상태를 확인 후 재시도 또는 취소 처리를 해야 합니다.
