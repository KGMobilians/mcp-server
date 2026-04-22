# 결제 승인 - MOBILID 방식

MOBILID 방식은 TID를 사용하지 않는 가맹점을 위한 결제 승인 방식입니다. `mode` 파라미터로 일반결제(`M001`)와 자동결제(`M002`)를 구분하며, 거래등록 없이 직접 승인을 요청할 수 있습니다.

- **HTTP Method**: POST
- **Content-Type**: application/json
- **PATH**: `/MUP/api/approval`
- **운영서버**: `https://mup.mobilians.co.kr/MUP/api/approval`
- **테스트서버**: `https://test.mobilians.co.kr/MUP/api/approval`

> **보안 주의**: 결제 승인 API는 반드시 서버 사이드에서 호출해야 합니다.

## 요청 파라미터

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `mode` | string | 4 | Y | 승인 모드. `M001`: 일반결제, `M002`: 자동결제 |
| `cash_code` | string | 2 | Y | 결제수단. `MC`: 휴대폰, `CN`: 신용카드 등 |
| `site_url` | string | 20 | Y | 가맹점 사이트 URL |
| `sid` | string | 12 | Y | 가맹점 코드 |
| `product_name` | string | 50 | Y | 상품명 |
| `amount` | string | 10 | Y | 총 결제 금액 |
| `mobil_id` | string | 50 | N | KG파이낸셜 거래번호 |
| `trade_id` | string | 50 | Y | 가맹점 거래번호 |
| `bill_key` | string | 40 | N | 자동결제 키. `mode=M002`(자동결제) 시 사용 |

### 휴대폰 결제 추가 파라미터

| 필드 | 타입 | 최대길이 | 필수 | 설명 |
|------|------|----------|------|------|
| `phone_no` | string | 11 | N | 휴대폰번호 |
| `mc_user_key` | string | 15 | Y | 휴대폰정보 대체 키 |

## 응답 파라미터

| 필드 | 타입 | 최대길이 | 설명 |
|------|------|----------|------|
| `code` | string | 4 | 응답 코드. `0000`: 성공 |
| `message` | string | 100 | 응답 메시지 |
| `sid` | string | 12 | 가맹점 코드 |
| `sign_date` | string | 14 | 승인시간 |
| `trade_id` | string | 50 | 가맹점 거래번호 |
| `cash_code` | string | 2 | 결제수단 |
| `mobil_id` | string | 20 | KG파이낸셜 거래번호 |
| `amount` | string | 10 | 총 결제 금액 |
| `hmac` | string | 44 | 무결성 검증용 hash |

### 결제수단별 추가 응답

**휴대폰 (MC)**: `mc_bill_key`, `mc_user_key`, `mc_simple_key`

**신용카드 (CN)**: `cn_installment`, `cn_card_no`, `cn_card_code`, `cn_card_name`, `cn_appr_no`

## 요청 예제

```json
{
  "mode": "M001",
  "cash_code": "MC",
  "site_url": "mcash.co.kr",
  "sid": "000730010001",
  "product_name": "테스트상품",
  "amount": "1000",
  "trade_id": "ORDER_20250704_001",
  "mc_user_key": "USER_KEY_VALUE"
}
```

## 응답 예제

```json
{
  "code": "0000",
  "message": "정상처리",
  "sid": "000730010001",
  "sign_date": "20190619160850",
  "trade_id": "ORDER_20250704_001",
  "cash_code": "MC",
  "mobil_id": "20190619160850826790",
  "amount": "1000",
  "hmac": "I3qi5h256KJKTbbKAlC9pXFiVaAgb/E2ci6ZgkjzVsg="
}
```

## TID 방식과 MOBILID 방식 비교

| 구분 | TID 방식 | MOBILID 방식 |
|------|----------|-------------|
| 사전 거래등록 | 필요 (거래 등록 API 호출) | 불필요 (직접 승인 호출) |
| 필수 키 | `tid` + `pay_token` | `mode` + `trade_id` |
| 자동결제 지원 | 별도 방식 | `mode=M002` + `bill_key` |
| 사용 시나리오 | 일반적인 결제 연동 | TID 미사용 가맹점, 자동결제 |
