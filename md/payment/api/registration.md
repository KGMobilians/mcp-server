# 거래 등록 API

MOBILPAY 결제를 시작하기 위해 가장 먼저 호출해야 하는 API입니다. 결제에 필요한 거래 정보를 등록하고, 결제창을 호출할 수 있는 `pay_url`을 응답으로 받습니다.

- **HTTP Method**: POST
- **Content-Type**: application/json
- **PATH**: `/MUP/api/registration`
- **운영서버**: `https://mup.mobilians.co.kr/MUP/api/registration`
- **테스트서버**: `https://test.mobilians.co.kr/MUP/api/registration`

> **주의**: 신용카드 서비스는 테스트서버를 제공하지 않습니다.

## 요청 파라미터 - 공통 필수

거래 등록 시 결제수단에 관계없이 반드시 전달해야 하는 공통 파라미터입니다.

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `sid` | string | 12 | Y | 가맹점 코드. 계약 시 발급받은 서비스 ID |
| `cash_code` | string | 2 | Y | 대표 결제수단 코드. `MC`: 휴대폰, `CN`: 신용카드, `RA`: 실계좌이체, `VA`: 가상계좌, `EP`: 간편결제, `TM`: 교통카드(모바일티머니) |
| `product_name` | string | 50 | Y | 상품명 |
| `trade_id` | string | 40 | Y | 가맹점 거래번호. 가맹점에서 고유하게 생성하는 주문번호 |
| `site_url` | string | 20 | Y | 가맹점 사이트 URL |
| `ok_url` | string | 128 | Y | 결제(인증) 결과를 수신할 URL. 결제 완료 후 이 URL로 결과가 POST 전달됨 |

## 요청 파라미터 - 금액 정보

결제 금액과 세금 관련 파라미터입니다. `amount` 객체 안에 하위 필드로 전달합니다.

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `amount.total` | number | 10 | Y | 총 결제 금액 |
| `amount.tax` | number | 10 | N | 세금 (신용카드) |
| `amount.tax_free` | number | 10 | N | 면세 금액 (신용카드) |
| `amount.supply_value` | number | 10 | N | 공급가액 (신용카드) |

## 요청 파라미터 - 공통 선택

결제수단에 관계없이 선택적으로 전달할 수 있는 공통 파라미터입니다.

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `deposit` | number | 10 | N | 1회용 컵 보증금 금액. 휴대폰결제, 신용카드, 실계좌이체에서 지원 |
| `call_type` | string | 4 | N | 결제창 호출 방식. `P`: popup (기본값), `S`: self, `I`: iframe |
| `hybrid_pay` | string | 1 | N | 하이브리드 결제 사용 여부. `Y`: 인증만 처리 (가맹점이 별도 승인 API 호출 필요), `N`: 인증+승인 동시 처리 (기본값) |
| `integrate_pay` | string | 1 | N | 통합 결제 사용 여부. `Y`: 사용, `N`: 미사용 (기본값) |
| `integrate_pay_sequence` | string | 50 | N | 통합 결제 결제수단 노출 순서. 예: `MC^CN^RA` (휴대폰, 신용카드, 계좌이체 순). cash_code를 구분자 `^`로 구분 |
| `noti_url` | string | 128 | N | 결제 결과 처리 URL. 시스템 back단에서 승인 결과를 최대 20회 반복 호출. **가상계좌는 입금완료 노티를 위해 반드시 세팅 필요** |
| `noti_email` | string | 30 | N | 가맹점 담당자 이메일. 결제 결과 노티 실패 시 알람 발송 |
| `close_url` | string | 128 | N | 취소 버튼 클릭 시 redirect URL. call_type이 `S` 또는 `I`일 때 필수 |
| `fail_url` | string | 128 | N | 결제 실패 시 redirect URL |
| `user_id` | string | 50 | N | 사용자 ID |
| `user_name` | string | 50 | N | 사용자 이름 |
| `user_email` | string | 30 | N | 사용자 이메일. `ra_direct=Y, ra_escrow=Y`일 경우 필수 |
| `business_no` | string | 13 | N | 사업자번호 |
| `seller_tel` | string | 15 | N | 판매자 전화번호 |
| `seller_name` | string | 50 | N | 판매자 명 |
| `only_once` | string | 1 | N | 반복결제 설정. `Y`: 단건 결제, `N`: 다건 결제 (기본값) |
| `time_stamp` | string | 14 | N | 호출 가능 유효 시간 지정. `yyyymmddhhmmss` 형식. 세팅시간 +10분간 유효. `99999999999999` 세팅 시 최대 30일간 유효. 미사용 시 10분간 유효 |
| `mstr` | string | 2000 | N | 가맹점 콜백 변수. 결제정보 외 리턴이 필요한 경우 사용. `&`, `%` 사용 불가. 예: `a=1\|b=2\|c=3` |
| `cp_logo` | string | 1 | N | 가맹점 로고 표기. `Y`: 표기 (사전 협의 및 이미지 등록 필요), `N`: 미표기 (기본값) |
| `entp_logo` | string | 8 | N | 법인 단위 로고 표기. 사전 협의 및 이미지 등록 필요 |
| `css_type` | string | 7 | N | 결제창 색상 설정. HTML 색상코드. 예: `#006EB9` |
| `cp_ui` | string | 20 | N | 가맹점별 UI 설정 |
| `app_scheme` | string | 50 | N | APP URL Scheme. 인앱 결제 시 앱으로 복귀하기 위한 스킴 |

## 요청 파라미터 - 결제창 영역 표시 옵션 (hidden_options)

결제창 내 특정 영역의 표시/숨김을 제어하는 파라미터입니다. `hidden_options` 객체 안에 하위 필드로 전달합니다.

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `hidden_options.info_area` | string | 1 | N | 하단 안내문구 영역 노출 여부. `Y`: 숨김, `N`: 노출 (기본값) |
| `hidden_options.footer_area` | string | 1 | N | footer 영역 노출 여부. `Y`: 숨김, `N`: 노출 (기본값) |
| `hidden_options.product_area` | string | 1 | N | 상품정보 영역 노출 여부. `Y`: 숨김, `N`: 노출 (기본값) |
| `hidden_options.contract_area` | string | 1 | N | 이용약관 영역 노출 여부. `A`: 모두 숨김, `N`: 노출 (기본값) |
| `hidden_options.email_area` | string | 1 | N | email 입력 영역 노출 여부. `Y`: 숨김, `N`: 노출 (기본값) |

## 요청 파라미터 - 분할 정산 결제

분할 정산 결제를 사용할 경우의 파라미터입니다. 신용카드만 사용 가능하며, 간편결제류 및 복합과세와 함께 사용할 수 없습니다.

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `divide_payment` | string | 1 | N | 분할 정산 결제 사용 여부. `Y`: 분할정산결제 |
| `divide_payment_list` | array | - | 조건부 | 분할 정산 결제 정보 배열. `divide_payment=Y` 세팅 시 필수. 최대 10건 |
| `divide_payment_list[].sid` | string | 12 | Y | 하위 가맹점 코드 |
| `divide_payment_list[].price` | string | 10 | Y | 상품 금액 |

## 요청 파라미터 - 휴대폰 결제 옵션 (pay_options)

결제수단이 휴대폰(`cash_code=MC`)인 경우 사용하는 옵션 파라미터입니다. `pay_options` 객체 안에 하위 필드로 전달합니다.

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `pay_options.mc_fix_birthno` | string | 1 | N | 사용자 생년월일 고정. `Y`: 고정 |
| `pay_options.mc_default_comm_id` | string | 3 | N | 이통사 기본 선택. `SKT`, `KTF`, `LGT`, `CJH`, `KCT`, `SKL` |
| `pay_options.mc_fix_comm_id` | string | 3 | N | 이통사 고정. `SKT`, `KTF`, `LGT`, `CJH`, `KCT`, `SKL` |
| `pay_options.mc_auto_pay` | string | 1 | N | 자동결제. `Y`: 사용 |
| `pay_options.mc_safe_call` | string | - | N | ARS인증. `SAFECALL`: 사용 |
| `pay_options.mc_cp_code` | string | - | N | 리셀러 하위 상점 key |
| `pay_options.mc_fix_no` | string | 1 | N | 휴대폰번호 고정. `Y`: 사용 |
| `pay_options.mc_no` | string | 11 | N | 휴대폰번호. `01011112222` 형식 |
| `pay_options.mc_user_key` | string | 15 | N | 휴대폰정보 대체 key |
| `pay_options.mc_simple_pay` | string | 1 | N | 간소화 결제 여부. `Y`: 사용 |
| `pay_options.mc_simple_key` | string | 20 | N | 간소화 결제 key |

## 요청 파라미터 - 간편결제 옵션 (pay_options)

결제수단이 간편결제인 경우 사용하는 옵션 파라미터입니다. `pay_options` 객체 안에 하위 필드로 전달합니다. 간편결제를 사용하려면 `cash_code`를 `EP`로 설정하고, 아래 `ep_code`로 간편결제사를 지정합니다.

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `pay_options.ep_code` | string | 3 | Y | 간편결제 코드. `KKO`: 카카오페이, `TOS`: 토스, `NAV`: 네이버페이, `SSP`: 삼성페이, `PYC`: 페이코, `LTP`: 엘페이, `SSG`: SSG페이, `APP`: 애플페이 |
| `pay_options.ep_no` | string | 11 | N | 구매자 휴대폰번호. `01011112222` 형식. **SSG페이 결제 시 필수** |
| `pay_options.ep_pay_type` | string | 1 | N | 간편결제 결제수단. `C`: 카드 (기본값), `P`: 포인트 (네이버페이 포인트), `M`: 머니 (카카오페이 머니, 토스 머니) |
| `pay_options.ep_issue_type` | string | 1 | N | 간편결제 현금영수증 발급용도. `A`: 소득공제용 (기본값), `B`: 지출증빙용, `N`: 미발급. **네이버페이 포인트 결제 시 필수** |
| `pay_options.ep_issue_no` | string | 11 | N | 휴대폰번호 또는 사업자번호. `ep_issue_type`이 `A` 또는 `B`일 경우 필수. 소득공제: 휴대폰번호, 지출증빙: 사업자번호. **네이버페이 포인트 결제 및 현금영수증 발급 시 필수** |
| `pay_options.ep_bill_type` | string | 2 | N | 과세 비과세 구분. `00`: 과세, `10`: 면세, `20`: 복합과세, `11`: 거래확인과세, `21`: 거래확인비과세 |
| `pay_options.ep_card_code` | string | 3 | N | 간편결제 카드사 고정. 카카오페이, 네이버페이, 토스 지원. 신용카드코드표 참고 |
| `pay_options.ep_installment` | string | 2 | N | 간편결제 카드사 고정 할부개월. 카카오페이, 네이버페이, 토스 지원 |

## 요청 파라미터 - 신용카드 옵션 (pay_options)

결제수단이 신용카드(`cash_code=CN`)인 경우 사용하는 옵션 파라미터입니다. `pay_options` 객체 안에 하위 필드로 전달합니다.

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `pay_options.cn_installment` | string | - | N | 할부 정보 |
| `pay_options.cn_bill_type` | string | 2 | N | 과세 비과세 구분. `00`: 과세, `10`: 면세, `20`: 복합과세, `11`: 거래확인과세, `21`: 거래확인비과세 |
| `pay_options.cn_point` | string | 1 | N | 포인트 사용 여부. `Y`: 사용, `N`: 미사용, `S`: 사용여부 사용자 선택 |
| `pay_options.cn_fix_card` | string | - | N | 카드 고정. 신용카드코드표 참고. 카드 추가 시 구분자 `:` 사용. 카카오페이: `KKO`, 카카오뱅크: `KKB`로 설정 |
| `pay_options.cn_direct` | string | - | N | 카드 다이렉트 호출. `카드코드:할부개월` 형식. 예: `SHN:00`. 카카오페이: `KKO`, 카카오뱅크: `KKB`로 설정 |
| `pay_options.cn_pay_type` | string | - | N | 망취소 옵션 |
| `pay_options.cn_fix_installment` | string | - | N | 할부 고정 |
| `pay_options.cn_easypay_type` | string | 1 | N | 간편결제 결제수단. `C`: 카드 (기본값), `P`: 포인트 (네이버페이 포인트), `M`: 머니 (카카오페이 머니) |
| `pay_options.cn_issue_type` | string | 1 | N | 간편결제 현금영수증 발급용도. `A`: 소득공제용 (기본값), `B`: 지출증빙용, `N`: 미발급. **네이버페이 포인트 결제 시 필수** |
| `pay_options.cn_issue_no` | string | 11 | N | 휴대폰번호 또는 사업자번호. 소득공제: 휴대폰번호, 지출증빙: 사업자번호 |
| `pay_options.cn_pay_app_use_yn` | string | 1 | N | 우리카드 우리페이(WON카드, WON뱅킹) 결제만 제공. `Y`: 사용, `N`: 미사용 (기본값) |
| `pay_options.cn_pay_app_use_cd` | string | 2 | N | 우리카드 우리페이 중 단독 결제. `cn_pay_app_use_yn`이 `Y`이어야 함. `01`: WON카드, `02`: WON뱅킹 |

## 요청 파라미터 - 계좌이체 옵션 (pay_options)

결제수단이 실계좌이체(`cash_code=RA`)인 경우 사용하는 옵션 파라미터입니다. `pay_options` 객체 안에 하위 필드로 전달합니다.

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `pay_options.ra_escrow` | string | 1 | N | 에스크로 사용 여부. `Y`: 사용, `N`: 미사용 (기본값) |
| `pay_options.ra_escrow_phone_no` | string | 20 | N | 에스크로 휴대폰번호. `ra_direct=Y, ra_escrow=Y`일 경우 필수 |
| `pay_options.ra_escrow_password` | string | 20 | N | 에스크로 구매비밀번호. `ra_direct=Y, ra_escrow=Y`일 경우 필수 |
| `pay_options.ra_cash_receipt` | string | 1 | N | 현금영수증 발급 여부. `Y`: 사용, `N`: 미사용 (기본값) |
| `pay_options.ra_issue_type` | string | 1 | N | 현금영수증 발급용도. `A`: 소득공제용, `B`: 지출증빙용. `ra_direct=Y, ra_cash_receipt=Y`일 경우 필수 |
| `pay_options.ra_issue_no` | string | 20 | N | 휴대폰번호 또는 사업자번호. `ra_direct=Y, ra_cash_receipt=Y`일 경우 필수. 소득공제: 휴대폰번호, 지출증빙: 사업자번호 |
| `pay_options.ra_direct` | string | 1 | Y | 뱅크페이 다이렉트 호출여부. `Y`: 사용, `N`: 미사용 (기본값) |

## 요청 파라미터 - 가상계좌 옵션 (pay_options)

결제수단이 가상계좌(`cash_code=VA`)인 경우 사용하는 옵션 파라미터입니다. `pay_options` 객체 안에 하위 필드로 전달합니다.

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `pay_options.va_bank_code` | string | 3 | N | 은행코드. 금융기관코드표 참고 |
| `pay_options.va_deposit_closure` | string | 8 | Y | 입금마감일자. `YYYYMMDD` 형식. 예: `20090617`. 보통 현재날짜 + 3일 설정 (최대: 거래일 + 7일) |
| `pay_options.va_account_closure` | string | 8 | Y | 계좌만기일자. `YYYYMMDD` 형식. 예: `20090623`. 입금마감일 + 7일 |
| `pay_options.va_cash_receipt` | string | 1 | N | 현금영수증 노출 여부. `Y`: 노출 (기본값), `N`: 미노출 |
| `pay_options.va_escrow` | string | 1 | N | 에스크로 노출 여부. `Y`: 노출, `N`: 미노출 (기본값) |
| `pay_options.va_email` | string | 1 | N | 이메일 입력 필수 여부. `Y`: 필수 (기본값), `N`: 선택 |

## 요청 파라미터 - 모바일티머니 옵션 (pay_options)

결제수단이 교통카드(모바일티머니, `cash_code=TM`)인 경우 사용하는 옵션 파라미터입니다. `pay_options` 객체 안에 하위 필드로 전달합니다.

> **사용 조건**: 모바일티머니 결제를 사용하려면 `cash_code=TM` 고정, `hybrid_pay=Y` 필수입니다.

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `pay_options.tm_tmpay_yn` | string | 1 | N | 티머니페이 결제 사용 여부. `Y`: 사용, `N`: 미사용 (기본값) |
| `pay_options.tm_direct` | string | 1 | N | 티머니페이 다이렉트 호출 여부. `Y`: 사용, `N`: 미사용 (기본값) |

## 응답 파라미터

거래 등록 API 호출 성공 시 반환되는 응답 파라미터입니다. `code`가 `0000`이면 정상 처리입니다.

| 필드 | 타입 | 최대길이 | 설명 |
|------|------|----------|------|
| `code` | string | 4 | 응답 코드. `0000`: 성공, 그 외: 실패 |
| `message` | string | 100 | 응답 메시지 |
| `sid` | string | 12 | 가맹점 코드 |
| `tid` | string | 20 | 거래등록 고유번호. 이후 결제창 호출 및 결제 승인에 사용 |
| `pay_url` | string | 300 | 결제창 호출 URL. 이 URL을 팝업 또는 iframe으로 호출하여 결제창을 표시 |
| `qrcode_url` | string | 300 | QRCode 링크 URL. QR코드 결제 시 사용 |
| `hmac` | string | 44 | 무결성 검증용 hash. HMAC-SHA256 알고리즘 사용. 메시지 무결성 검증 문서 참고 |
| `time_stamp` | string | 14 | 요청시간. 거래등록 요청 시 `time_stamp` 값을 사용한 경우 요청한 값을 반환 |

## 요청 예제

### 기본 결제 요청 (휴대폰 결제)

```json
{
  "sid": "YOUR_SID",
  "cash_code": "MC",
  "product_name": "테스트상품",
  "trade_id": "ORDER_20250704_001",
  "site_url": "www.example.com",
  "ok_url": "https://www.example.com/payment/result",
  "amount": {
    "total": 1000,
    "tax": 0,
    "tax_free": 0,
    "supply_value": 0
  }
}
```

### 하이브리드 결제 요청 (인증/승인 분리)

하이브리드 결제는 인증과 승인을 분리하여 처리하는 방식입니다. 거래등록 시 `hybrid_pay`를 `Y`로 설정하면, ok_url로 인증 결과만 수신한 후 가맹점이 별도로 결제 승인 API(`/MUP/api/approval`)를 호출해야 합니다.

```json
{
  "sid": "YOUR_SID",
  "cash_code": "MC",
  "product_name": "테스트상품",
  "trade_id": "ORDER_20250704_002",
  "site_url": "www.example.com",
  "ok_url": "https://www.example.com/payment/auth-result",
  "hybrid_pay": "Y",
  "amount": {
    "total": 5000,
    "tax": 0,
    "tax_free": 0,
    "supply_value": 0
  }
}
```

### 신용카드 결제 요청 (카드 고정 + 할부)

```json
{
  "sid": "YOUR_SID",
  "cash_code": "CN",
  "product_name": "프리미엄 상품",
  "trade_id": "ORDER_20250704_003",
  "site_url": "www.example.com",
  "ok_url": "https://www.example.com/payment/result",
  "amount": {
    "total": 50000,
    "tax": 4545,
    "tax_free": 0,
    "supply_value": 45455
  },
  "pay_options": {
    "cn_fix_card": "SHN",
    "cn_installment": "03"
  }
}
```

### 간편결제 요청 (카카오페이)

```json
{
  "sid": "YOUR_SID",
  "cash_code": "EP",
  "product_name": "간편결제 상품",
  "trade_id": "ORDER_20250704_004",
  "site_url": "www.example.com",
  "ok_url": "https://www.example.com/payment/result",
  "amount": {
    "total": 10000
  },
  "pay_options": {
    "ep_code": "KKO",
    "ep_pay_type": "C"
  }
}
```

### 모바일티머니 결제 요청

모바일티머니 결제는 `cash_code=TM` 고정, `hybrid_pay=Y` 필수입니다.

```json
{
  "sid": "YOUR_SID",
  "cash_code": "TM",
  "product_name": "교통카드 충전",
  "trade_id": "ORDER_20250704_008",
  "site_url": "www.example.com",
  "ok_url": "https://www.example.com/payment/auth-result",
  "hybrid_pay": "Y",
  "amount": {
    "total": 5000
  },
  "pay_options": {
    "tm_tmpay_yn": "Y",
    "tm_direct": "N"
  }
}
```

### 통합결제 요청 (여러 결제수단 동시 노출)

```json
{
  "sid": "YOUR_SID",
  "cash_code": "MC",
  "product_name": "통합결제 상품",
  "trade_id": "ORDER_20250704_005",
  "site_url": "www.example.com",
  "ok_url": "https://www.example.com/payment/result",
  "integrate_pay": "Y",
  "integrate_pay_sequence": "CN^MC^RA",
  "amount": {
    "total": 30000
  }
}
```

### 가상계좌 결제 요청

가상계좌 결제 시 `noti_url`은 입금 완료 통보를 수신하기 위해 반드시 세팅해야 합니다.

```json
{
  "sid": "YOUR_SID",
  "cash_code": "VA",
  "product_name": "가상계좌 상품",
  "trade_id": "ORDER_20250704_006",
  "site_url": "www.example.com",
  "ok_url": "https://www.example.com/payment/result",
  "noti_url": "https://www.example.com/payment/noti",
  "noti_email": "dev@example.com",
  "amount": {
    "total": 50000
  },
  "pay_options": {
    "va_deposit_closure": "20250707",
    "va_account_closure": "20250714",
    "va_cash_receipt": "Y"
  }
}
```

### 분할 정산 결제 요청

```json
{
  "sid": "YOUR_SID",
  "cash_code": "CN",
  "product_name": "분할정산 상품",
  "trade_id": "ORDER_20250704_007",
  "site_url": "www.example.com",
  "ok_url": "https://www.example.com/payment/result",
  "amount": {
    "total": 1000,
    "tax": 0,
    "tax_free": 0,
    "supply_value": 0
  },
  "divide_payment": "Y",
  "divide_payment_list": [
    { "sid": "YOUR_SID", "price": "300" },
    { "sid": "000730010002", "price": "500" },
    { "sid": "YOUR_SID", "price": "200" }
  ]
}
```

## 응답 예제

### 성공 응답

```json
{
  "code": "0000",
  "message": "정상처리",
  "sid": "YOUR_SID",
  "tid": "20190619160850826790",
  "pay_url": "https://mup.mobilians.co.kr/MUP/api/payment.mcash?tid=20190619160850826790",
  "qrcode_url": "https://mup.mobilians.co.kr/MUP/api/qr-code.mcash?tid=20190619160850826790",
  "hmac": "I3qi5h256KJKTbbKAlC9pXFiVaAgb/E2ci6ZgkjzVsg=",
  "time_stamp": "20190401090010"
}
```

### 실패 응답

```json
{
  "code": "6101",
  "message": "유효하지 않은 parameter"
}
```

## 거래 등록 후 다음 단계

거래 등록이 성공하면(`code=0000`), 응답으로 받은 `pay_url`을 사용하여 결제창을 호출합니다.

1. **결제창 호출**: `pay_url`을 팝업(`window.open`) 또는 iframe으로 호출합니다. `call_type`에 따라 호출 방식이 달라집니다.
2. **결제 진행**: 사용자가 결제창에서 결제를 진행합니다.
3. **결과 수신 (일반결제)**: `ok_url`로 승인 결과가 POST 전달됩니다. `code=0000` 확인 후 서비스를 제공합니다.
4. **결과 수신 (하이브리드결제)**: `ok_url`로 인증 결과가 POST 전달됩니다. 이후 결제 승인 API(`/MUP/api/approval`)를 별도 호출해야 합니다.

## HMAC 무결성 검증

거래등록 요청 시 HMAC 검증을 위한 메시지 구성:

- **key**: `skey` (별도 전달받은 서비스키)
- **message**: `amount(total)` + `ok_url` + `trade_id` + `time_stamp`
- **algorithm**: `Base64encode(HMAC_SHA256(key, message))`

응답으로 받은 `hmac` 값과 가맹점에서 직접 계산한 hmac 값을 비교하여 데이터 무결성을 검증합니다.

> **보안 주의사항**
> - `skey`는 절대 클라이언트(프론트엔드) 코드에 포함하지 마세요. 환경변수 또는 서버 설정 파일에서 로드해야 합니다.
> - HMAC 검증은 반드시 서버 사이드에서 수행해야 합니다.
> - `noti_url` 처리 시 중복 거래 방어 로직을 반드시 구현해야 합니다.

## 연동 시 주의사항

- **테스트/운영 도메인 분리**: 테스트 시 `https://test.mobilians.co.kr`, 운영 시 `https://mup.mobilians.co.kr`을 사용합니다. 단, 신용카드 서비스는 테스트서버를 제공하지 않습니다.
- **네이버페이**: iframe 환경에서는 지원 불가합니다. `call_type`을 `P`(popup) 또는 `S`(self)로 설정해야 합니다.
- **가상계좌 noti_url**: 가상계좌 결제 시 입금 완료 통보를 위해 `noti_url`을 반드시 세팅해야 합니다.
- **하이브리드 + 통합결제**: 동시 사용 시 실계좌이체는 결제수단으로 노출되지 않습니다.
- **submit 지양**: 결제창 호출 시 submit 방식 대신 `window.open` 또는 iframe을 사용하세요. IE11에서 about:blank 새 창 문제가 발생할 수 있습니다.
- **결제창 크기**: 신용카드 PC WEB은 820x600, 휴대폰/계좌이체는 390x613, MOBILE WEB은 최소 320x500(스크롤 허용 필수)입니다.
