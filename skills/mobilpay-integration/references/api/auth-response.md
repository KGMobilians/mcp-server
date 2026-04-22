# 결제 인증(승인) 응답

결제 창 호출(`pay_url`) 이후, 사용자가 결제를 완료하면 거래 등록 시 설정한 `ok_url`(또는 `fail_url`, `noti_url`)로 결제 결과가 POST 방식으로 전달됩니다. 일반결제인 경우 승인 결과가, 하이브리드결제인 경우 인증 결과가 전달됩니다.

- **Content-Type**: text/html
- **Charset**: euc-kr
- **Method**: POST

> **중요**: 응답 데이터의 인코딩이 `euc-kr`입니다. 서버 사이드에서 수신 시 인코딩 처리에 유의하세요.

## 공통 응답 파라미터

모든 결제수단에 공통으로 전달되는 파라미터입니다.

| 필드 | 타입 | 최대길이 | 응답구분 | 설명 |
|------|------|----------|----------|------|
| `code` | string | 4 | 인증/승인 | 응답 코드. `0000`: 성공, 그 외: 실패 |
| `message` | string | 100 | 인증/승인 | 응답 메시지 |
| `sid` | string | 12 | 인증/승인 | 가맹점 코드 |
| `tid` | string | 20 | 인증/승인 | 거래등록 고유번호 |
| `sign_date` | string | 14 | 승인 | 승인시간 |
| `trade_id` | string | 50 | 인증/승인 | 가맹점 거래번호 |
| `cash_code` | string | 2 | 인증/승인 | 결제수단. `MC`: 휴대폰, `CN`: 신용카드, `RA`: 실계좌이체, `VA`: 가상계좌 |
| `pay_token` | string | 20 | 인증/승인 | 결제 인증 토큰. 이후 결제 승인, 취소 등에 사용 |
| `product_name` | string | 50 | 승인 | 상품명 |
| `amount` | string | 10 | 인증/승인 | 총 결제 금액 |
| `deposit` | string | 10 | 인증/승인 | 1회용 컵 보증금 금액 |
| `mstr` | string | 2000 | 인증/승인 | 가맹점 콜백 변수. 거래 등록 시 전달한 값이 그대로 반환 |
| `hmac` | string | 44 | 인증/승인 | 무결성 검증용 hash. HMAC 무결성 검증 문서 참고 |

## 휴대폰 결제 응답 파라미터

결제수단이 휴대폰(`cash_code=MC`)인 경우 추가로 전달되는 파라미터입니다.

| 필드 | 타입 | 최대길이 | 응답구분 | 설명 |
|------|------|----------|----------|------|
| `phone_no` | string | 11 | 승인 | 휴대폰번호 |
| `mc_bill_key` | string | 50 | 인증/승인 | 자동결제 키. 자동결제 등록 시 발급 |
| `mc_user_key` | string | 15 | 인증/승인 | 휴대폰정보 대체 키 |
| `mc_simple_key` | string | 20 | 승인 | 간소화결제 키 |

## 신용카드 결제 응답 파라미터

결제수단이 신용카드(`cash_code=CN`)인 경우 추가로 전달되는 파라미터입니다.

| 필드 | 타입 | 최대길이 | 응답구분 | 설명 |
|------|------|----------|----------|------|
| `cn_installment` | string | 2 | 인증/승인 | 할부개월. `00`: 일시불 |
| `cn_card_no` | string | 20 | 승인(noti) | 카드번호 (마스킹 처리됨) |
| `cn_card_code` | string | 3 | 승인(noti) | 카드코드. 신용카드코드표 참고 |
| `cn_card_name` | string | 20 | 인증/승인 | 카드이름 |
| `cn_appr_no` | string | 8 | 승인 | 승인번호 |
| `cn_bill_key` | string | 50 | 인증/승인 | 자동결제 키 |
| `cn_coupon_price` | string | 10 | 인증/승인 | 쿠폰 사용 금액 |
| `cn_pay_method` | string | 1 | 인증/승인 | 지불 방법. `M`: 머니결제, `P`: 포인트 결제, `C` 또는 null: 카드결제 |
| `cn_own_cd` | string | 4 | 인증 | 카드소유구분. `0`: 개인, `1`: 법인, `2`: 구매전용, `3`: 개인/법인, `4`: 없음 |
| `cn_bill_yn` | string | 1 | 승인 | 현금영수증 발급여부. `Y`: 발급, `N` 또는 null: 미발급 |

## 간편결제 응답 파라미터

간편결제를 사용한 경우 추가로 전달되는 파라미터입니다.

| 필드 | 타입 | 최대길이 | 응답구분 | 설명 |
|------|------|----------|----------|------|
| `ep_installment` | string | 2 | 인증/승인 | 할부개월 |
| `ep_card_no` | string | 20 | 승인(noti) | 카드번호 (마스킹 처리됨) |
| `ep_card_code` | string | 3 | 승인(noti) | 카드코드. 신용카드코드표 참고 |
| `ep_card_name` | string | 20 | 인증/승인 | 카드이름 |
| `ep_appr_no` | string | 8 | 승인 | 승인번호 |
| `ep_coupon_price` | string | 10 | 인증/승인 | 쿠폰 사용 금액 |
| `ep_pay_method` | string | 1 | 인증/승인 | 지불 방법. `M`: 머니결제, `P`: 포인트 결제, `C` 또는 null: 카드결제 |
| `ep_bill_yn` | string | 1 | 승인 | 현금영수증 발급여부. `Y`: 발급, `N` 또는 null: 미발급 |

## 계좌이체 응답 파라미터

결제수단이 실계좌이체(`cash_code=RA`)인 경우 추가로 전달되는 파라미터입니다.

| 필드 | 타입 | 최대길이 | 응답구분 | 설명 |
|------|------|----------|----------|------|
| `bank_name` | string | 10 | 승인 | 은행명 |
| `cash_receipt` | string | 1 | 승인 | 현금영수증 발급여부 |
| `ra_bill_yn` | string | 1 | 인증 | 현금영수증 유무 |
| `ra_reference_key` | string | 20 | 인증 | 실계좌이체 참조 키. 하이브리드결제 승인 시 `reference_key`로 전달 |

## 가상계좌 응답 파라미터

결제수단이 가상계좌(`cash_code=VA`)인 경우 추가로 전달되는 파라미터입니다.

| 필드 | 타입 | 최대길이 | 응답구분 | 설명 |
|------|------|----------|----------|------|
| `bank_code` | string | 2 | 승인 | 은행 코드. 금융기관코드표 참고 |
| `account_no` | string | 50 | 승인 | 가상 계좌번호 |
| `deposit_closure` | string | 8 | 승인 | 입금 마감 일자 |
| `cash_receipt` | string | 1 | 승인 | 현금영수증 발급 여부 |
| `va_name` | string | 30 | 인증 | 입금자명 |
| `va_bill_yn` | string | 1 | 인증 | 현금영수증 유무 |
| `va_reference_key` | string | 20 | 인증 | 가상계좌 참조 키. 하이브리드결제 승인 시 `reference_key`로 전달 |

## 결과 수신 처리 예제 (Node.js/Express)

```javascript
const express = require('express');
const crypto = require('crypto');
const iconv = require('iconv-lite');
const app = express();

const SKEY = process.env.MOBILPAY_SKEY;

// euc-kr 인코딩 처리
app.use('/payment/result', express.urlencoded({
  extended: true,
  // euc-kr → utf-8 변환이 필요한 경우
}));

// ok_url: 결제 인증/승인 결과 수신
app.post('/payment/result', (req, res) => {
  const { code, message, sid, tid, trade_id, cash_code,
          pay_token, amount, hmac, sign_date } = req.body;

  // 1. 응답 코드 확인
  if (code !== '0000') {
    console.error('결제 실패:', code, message);
    // 실패 처리 로직
    return res.send('FAIL');
  }

  // 2. 금액 검증: 최초 요청 금액과 동일한지 확인
  const originalAmount = getOriginalAmount(trade_id); // DB에서 원래 주문 금액 조회
  if (String(originalAmount) !== String(amount)) {
    console.error('금액 불일치:', originalAmount, amount);
    return res.send('FAIL');
  }

  // 3. HMAC 무결성 검증
  // 거래등록/인증/승인: amount + ok_url + trade_id + time_stamp
  // (time_stamp는 거래등록 응답에서 받은 값 사용)
  const storedTimeStamp = getStoredTimeStamp(trade_id);
  const hmacMessage = amount + 'https://www.example.com/payment/result'
    + trade_id + storedTimeStamp;
  const calculatedHmac = crypto.createHmac('sha256', SKEY)
    .update(hmacMessage, 'utf8').digest('base64');

  if (calculatedHmac !== hmac) {
    console.error('HMAC 검증 실패');
    return res.send('FAIL');
  }

  // 4. 중복 거래 체크
  if (isAlreadyProcessed(trade_id)) {
    // 이미 처리된 거래 → SUCCESS 출력 (재호출 방지)
    return res.send('SUCCESS');
  }

  // 5. 결제 성공 처리
  processPaymentSuccess(trade_id, pay_token, amount, cash_code);

  // 6. SUCCESS 출력 (HTML 코드 없이 문자만 출력)
  res.send('SUCCESS');
});
```

## 일반결제 vs 하이브리드결제 응답 차이

| 구분 | 일반결제 | 하이브리드결제 |
|------|----------|---------------|
| ok_url 응답 내용 | 승인 완료 결과 (code, sign_date, 카드정보 등 포함) | 인증 완료 결과 (code, pay_token 등. 승인 정보 미포함) |
| 승인 처리 | 자동 처리됨 (별도 작업 불필요) | 가맹점이 결제 승인 API(`/MUP/api/approval`)를 별도 호출 필요 |
| pay_token 용도 | 결제 취소 시 사용 | 결제 승인 API 호출 시 전달 + 결제 취소 시 사용 |
| sign_date | ok_url 응답에 포함 | 결제 승인 API 응답에 포함 |

> **하이브리드결제**: ok_url로 인증 결과를 수신한 후, `code=0000`을 확인하고 결제 승인 API(`/MUP/api/approval`)를 호출해야 최종 결제가 완료됩니다. 결제 승인 API에 대한 상세는 결제 승인 - TID 방식(`approval-tid.md`) 문서를 참고하세요.

## 응답 처리 시 필수 검증 항목

결과를 수신하여 SUCCESS를 출력하기 전에 반드시 아래 항목을 모두 검증해야 합니다.

1. **code 확인**: `0000`(성공) 여부
2. **pay_token 확인**: 결제 토큰 존재 여부 (최대 15byte)
3. **amount 확인**: 최초 요청한 금액과 동일한지 반드시 비교
4. **IP 확인**: `noti_url` 페이지 호출 IP가 KG파이낸셜 결제서버 IP인지 확인 (방화벽 설정 문서 참고)
5. **hmac 비교**: HMAC 무결성 검증

> **보안 주의**: SUCCESS/FAIL 출력은 소스코드나 HTML 코드 없이 해당 문자만 페이지상에 출력해야 합니다.
