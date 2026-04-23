# 가상계좌

가상계좌는 온라인 결제를 위해 발급되는 임시 계좌입니다. 사용자가 가상계좌 결제를 요청하면 고유한 가상 계좌번호가 발급되고, 해당 계좌에 정확한 금액을 입금하면 결제가 완료됩니다.

가상계좌 결제는 다른 결제수단과 달리 결제 요청과 입금 완료가 시간적으로 분리되므로, `noti_url`을 통한 입금 완료 통보 처리가 필수적입니다.

## 가상계좌 결제 플로우

```
[1] 가맹점 서버 → MOBILPAY: 거래 등록 (cash_code=VA, noti_url 필수 세팅)
[2] 클라이언트: 결제 창에서 가상계좌 발급 요청
[3] MOBILPAY → 가맹점: ok_url로 가상계좌 정보 전달 (bank_code, account_no, deposit_closure)
[4] 가맹점: 사용자에게 가상계좌 정보 안내
[5] 사용자: 해당 가상계좌에 입금
[6] MOBILPAY → 가맹점: noti_url로 입금 완료 통보 (최대 20회 반복)
[7] 가맹점: 입금 확인 후 서비스 제공, SUCCESS 출력
```

## 가상계좌 채번 취소

발급된 가상계좌의 채번을 취소하는 API입니다. 사용자가 입금하기 전에만 취소할 수 있습니다.

- **HTTP Method**: POST
- **Content-Type**: application/json
- **PATH**: `/MUP/api/account-expire`
- **운영서버**: `https://mup.mobilians.co.kr/MUP/api/account-expire`

### 요청 파라미터

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `sid` | string | 12 | Y | 가맹점 코드 |
| `trade_id` | string | 40 | Y | 가맹점 거래번호 |
| `pay_token` | string | 50 | Y | 결제 토큰 |
| `amount` | string | 10 | Y | 총 결제 금액 |

### 응답 파라미터

| 필드 | 타입 | 최대길이 | 설명 |
|------|------|----------|------|
| `code` | string | 4 | 응답 코드. `0000`: 성공 |
| `message` | string | 100 | 응답 메시지 |
| `trade_id` | string | 40 | 가맹점 거래번호 |
| `pay_token` | string | 20 | 결제 토큰 |

### 요청 예제

```json
{
  "sid": "YOUR_SID",
  "trade_id": "ORDER_20250704_006",
  "pay_token": "1904258548577654668",
  "amount": "50000"
}
```

### 응답 예제

```json
{
  "code": "0000",
  "message": "정상처리",
  "trade_id": "ORDER_20250704_006",
  "pay_token": "1904258548577654668"
}
```

## 가상계좌 입금 완료 통보 (noti_url)

사용자 입금이 완료되면 거래등록 시 설정한 `noti_url`로 결과를 통보합니다.

### noti_url 결과 파라미터

| 필드 | 타입 | 설명 |
|------|------|------|
| `Resultcd` | string | 결과코드. `0000`: 입금 완료 |
| `Prdtprice` | string | 결제금액 |
| `Prdtnm` | string | 상품명 |
| `Userid` | string | 사용자 아이디 |
| `Rcptname` | string | 사용자명 |
| `Name` | string | 가상계좌번호로 입금할 입금자명 |
| `Rcptresultdt` | string | 입금 마감 일자 |
| `Accountno` | string | 가상 계좌번호 |
| `Bankcode` | string | 은행 코드 |
| `Mobilid` | string | 모빌 거래번호 (`pay_token`과 동일한 값) |
| `Tradeid` | string | 가맹점 거래번호 |
| `Svcid` | string | 가맹점 코드 |

### noti_url 필수 확인 항목

입금 완료 통보를 수신한 후 SUCCESS를 출력하기 전에 반드시 아래 항목을 검증해야 합니다.

| 항목 | 검증 내용 |
|------|----------|
| `Resultcd` | 결과값이 `0000`인지 확인 |
| `Mobilid` | KG파이낸셜 거래번호 존재 여부 (15byte 이하) |
| `Prdtprice` | 최초 사용자가 선택한 입금 금액과 일치하는지 확인 |
| IP | noti_url 호출 IP가 KG파이낸셜 결제 서버 IP인지 확인: `175.158.12.1`, `116.127.121.132`, `175.158.12.2` |

### noti_url 처리 예제 (Node.js/Express)

```javascript
// 가상계좌 입금 완료 noti_url 처리
app.post('/payment/va-noti', (req, res) => {
  const { Resultcd, Prdtprice, Mobilid, Tradeid, Accountno, Bankcode } = req.body;

  // 1. 호출 IP 검증
  const allowedIPs = ['175.158.12.1', '116.127.121.132', '175.158.12.2'];
  const clientIP = req.ip || req.connection.remoteAddress;
  if (!allowedIPs.includes(clientIP.replace('::ffff:', ''))) {
    return res.send('FAIL');
  }

  // 2. 결과코드 확인
  if (Resultcd !== '0000') {
    return res.send('FAIL');
  }

  // 3. 금액 검증
  const originalAmount = getOriginalAmount(Tradeid);
  if (String(originalAmount) !== String(Prdtprice)) {
    return res.send('FAIL');
  }

  // 4. 중복 처리 방어
  if (isAlreadyProcessed(Tradeid)) {
    return res.send('SUCCESS'); // 이미 처리된 거래 → SUCCESS (재호출 방지)
  }

  // 5. 입금 확인 처리
  processVirtualAccountDeposit(Tradeid, Mobilid, Prdtprice, Bankcode, Accountno);

  // 6. SUCCESS 출력 (HTML 코드 없이 문자만)
  res.send('SUCCESS');
});
```

## 거래 등록 시 필수 설정

가상계좌 결제를 위해 거래 등록 API 호출 시 아래 파라미터를 반드시 설정해야 합니다.

| 파라미터 | 필수 | 설명 |
|----------|------|------|
| `cash_code` | Y | `VA` (가상계좌) |
| `noti_url` | **필수** | 입금 완료 통보 URL. 미설정 시 입금 완료를 알 수 없음 |
| `noti_email` | 권장 | 노티 실패 시 알람 수신 이메일 |
| `pay_options.va_deposit_closure` | Y | 입금마감일자. YYYYMMDD 형식. 보통 현재날짜+3일 (최대 거래일+7일) |
| `pay_options.va_account_closure` | Y | 계좌만기일자. YYYYMMDD 형식. 입금마감일+7일 |

## 주의사항

- `noti_url`은 가상계좌 결제 시 **반드시** 세팅해야 합니다. 미설정 시 입금 완료를 감지할 수 없습니다.
- `noti_url` 페이지에서 SUCCESS를 출력하지 않으면 최대 20회까지 반복 호출됩니다. 재호출로 인한 서비스 중복 제공에 유의하세요.
- 이미 처리된 거래가 재호출될 경우 SUCCESS를 출력하는 방어 로직을 반드시 구현하세요.
- SUCCESS/FAIL 출력은 HTML 코드 없이 해당 문자만 출력해야 합니다.
