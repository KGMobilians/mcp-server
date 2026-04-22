export interface AmountDetail {
  total: number;
  tax?: number;
  tax_free?: number;
  supply_value?: number;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  cashCode: string;
  cashCodeName: string;
  callType: "P" | "S" | "I";
  callTypeName: string;
  hybridPay: "Y" | "N";
  useNotiUrl: boolean;
  amount: number | AmountDetail;
  productName: string;
  payOptions?: Record<string, string>;
}

/* ── 휴대폰결제(MC) 테스트 케이스 ── */
export const MC_CASES: TestCase[] = [
  {
    id: "MC-01",
    name: "일반결제 + Popup + ok_url만",
    description: "가장 기본적인 휴대폰결제. 일반 플로우, 팝업 호출, ok_url로만 결과 수신.",
    cashCode: "MC",
    cashCodeName: "휴대폰결제",
    callType: "P",
    callTypeName: "Popup",
    hybridPay: "N",
    useNotiUrl: false,
    amount: 1000,
    productName: "[TEST] 휴대폰 일반-팝업-okUrl",
  },
  {
    id: "MC-02",
    name: "일반결제 + Popup + ok_url + noti_url",
    description: "일반 플로우에 noti_url 웹훅까지 활성화. ok_url과 noti_url 양쪽 수신 확인.",
    cashCode: "MC",
    cashCodeName: "휴대폰결제",
    callType: "P",
    callTypeName: "Popup",
    hybridPay: "N",
    useNotiUrl: true,
    amount: 1000,
    productName: "[TEST] 휴대폰 일반-팝업-okUrl+notiUrl",
  },
  {
    id: "MC-03",
    name: "하이브리드결제 + Popup + ok_url만",
    description: "하이브리드 플로우. 인증만 완료 후 서버에서 별도 승인 API 호출 필요.",
    cashCode: "MC",
    cashCodeName: "휴대폰결제",
    callType: "P",
    callTypeName: "Popup",
    hybridPay: "Y",
    useNotiUrl: false,
    amount: 1000,
    productName: "[TEST] 휴대폰 하이브리드-팝업-okUrl",
  },
  {
    id: "MC-04",
    name: "하이브리드결제 + Popup + ok_url + noti_url",
    description: "하이브리드 플로우 + noti_url 웹훅. 인증 후 승인 API 호출 + 웹훅 수신.",
    cashCode: "MC",
    cashCodeName: "휴대폰결제",
    callType: "P",
    callTypeName: "Popup",
    hybridPay: "Y",
    useNotiUrl: true,
    amount: 1000,
    productName: "[TEST] 휴대폰 하이브리드-팝업-okUrl+notiUrl",
  },
  {
    id: "MC-05",
    name: "일반결제 + Self(페이지전환) + ok_url",
    description: "결제창을 현재 페이지에서 전환(Self). close_url 필수.",
    cashCode: "MC",
    cashCodeName: "휴대폰결제",
    callType: "S",
    callTypeName: "Self(페이지전환)",
    hybridPay: "N",
    useNotiUrl: false,
    amount: 1000,
    productName: "[TEST] 휴대폰 일반-Self-okUrl",
  },
  {
    id: "MC-06",
    name: "일반결제 + iframe + ok_url",
    description: "결제창을 iframe으로 임베드. close_url 필수.",
    cashCode: "MC",
    cashCodeName: "휴대폰결제",
    callType: "I",
    callTypeName: "iframe",
    hybridPay: "N",
    useNotiUrl: false,
    amount: 1000,
    productName: "[TEST] 휴대폰 일반-iframe-okUrl",
  },
];

/* ── 신용카드(CN) 테스트 케이스 ── */
export const CN_CASES: TestCase[] = [
  {
    id: "CN-01",
    name: "일시불 + Popup + ok_url만",
    description: "가장 기본적인 신용카드 결제. 일시불, 팝업 호출, ok_url로만 결과 수신.",
    cashCode: "CN",
    cashCodeName: "신용카드",
    callType: "P",
    callTypeName: "Popup",
    hybridPay: "N",
    useNotiUrl: false,
    amount: 1000,
    productName: "[TEST] 신용카드 일시불-팝업-okUrl",
  },
  {
    id: "CN-02",
    name: "일시불 + Popup + ok_url + noti_url",
    description: "일시불 결제에 noti_url 웹훅까지 활성화. ok_url과 noti_url 양쪽 수신 확인.",
    cashCode: "CN",
    cashCodeName: "신용카드",
    callType: "P",
    callTypeName: "Popup",
    hybridPay: "N",
    useNotiUrl: true,
    amount: 1000,
    productName: "[TEST] 신용카드 일시불-팝업-okUrl+notiUrl",
  },
  {
    id: "CN-03",
    name: "하이브리드결제 + Popup + ok_url만",
    description: "하이브리드 플로우. 인증만 완료 후 서버에서 별도 승인 API 호출 필요.",
    cashCode: "CN",
    cashCodeName: "신용카드",
    callType: "P",
    callTypeName: "Popup",
    hybridPay: "Y",
    useNotiUrl: false,
    amount: 1000,
    productName: "[TEST] 신용카드 하이브리드-팝업-okUrl",
  },
  {
    id: "CN-04",
    name: "하이브리드결제 + Popup + ok_url + noti_url",
    description: "하이브리드 플로우 + noti_url 웹훅. 인증 후 승인 API 호출 + 웹훅 수신.",
    cashCode: "CN",
    cashCodeName: "신용카드",
    callType: "P",
    callTypeName: "Popup",
    hybridPay: "Y",
    useNotiUrl: true,
    amount: 1000,
    productName: "[TEST] 신용카드 하이브리드-팝업-okUrl+notiUrl",
  },
  {
    id: "CN-05",
    name: "일시불 + Self(페이지전환) + ok_url",
    description: "결제창을 현재 페이지에서 전환(Self). close_url 필수.",
    cashCode: "CN",
    cashCodeName: "신용카드",
    callType: "S",
    callTypeName: "Self(페이지전환)",
    hybridPay: "N",
    useNotiUrl: false,
    amount: 1000,
    productName: "[TEST] 신용카드 일시불-Self-okUrl",
  },
  {
    id: "CN-06",
    name: "일시불 + iframe + ok_url",
    description: "결제창을 iframe으로 임베드. close_url 필수.",
    cashCode: "CN",
    cashCodeName: "신용카드",
    callType: "I",
    callTypeName: "iframe",
    hybridPay: "N",
    useNotiUrl: false,
    amount: 1000,
    productName: "[TEST] 신용카드 일시불-iframe-okUrl",
  },
  {
    id: "CN-07",
    name: "할부(3개월) + Popup + ok_url",
    description: "3개월 할부 결제. cn_installment 옵션으로 할부 개월 수 지정.",
    cashCode: "CN",
    cashCodeName: "신용카드",
    callType: "P",
    callTypeName: "Popup",
    hybridPay: "N",
    useNotiUrl: false,
    amount: 50000,
    productName: "[TEST] 신용카드 할부3개월-팝업-okUrl",
    payOptions: { cn_installment: "03" },
  },
  {
    id: "CN-08",
    name: "카드사 고정(신한카드) + Popup + ok_url",
    description: "결제창에서 신한카드만 노출. cn_fix_card 옵션으로 카드사 고정.",
    cashCode: "CN",
    cashCodeName: "신용카드",
    callType: "P",
    callTypeName: "Popup",
    hybridPay: "N",
    useNotiUrl: false,
    amount: 1000,
    productName: "[TEST] 신용카드 카드고정(신한)-팝업-okUrl",
    payOptions: { cn_fix_card: "SHN" },
  },
  {
    id: "CN-09",
    name: "면세 거래 + Popup + ok_url",
    description: "면세 상품 결제. cn_bill_type=10, 전액 면세 금액으로 처리.",
    cashCode: "CN",
    cashCodeName: "신용카드",
    callType: "P",
    callTypeName: "Popup",
    hybridPay: "N",
    useNotiUrl: false,
    amount: { total: 1000, tax_free: 1000 },
    productName: "[TEST] 신용카드 면세-팝업-okUrl",
    payOptions: { cn_bill_type: "10" },
  },
  {
    id: "CN-10",
    name: "복합과세 + Popup + ok_url",
    description: "과세+면세 혼합 결제. cn_bill_type=20, 공급가액/세금/면세 금액 분리.",
    cashCode: "CN",
    cashCodeName: "신용카드",
    callType: "P",
    callTypeName: "Popup",
    hybridPay: "N",
    useNotiUrl: false,
    amount: { total: 1000, supply_value: 455, tax: 45, tax_free: 500 },
    productName: "[TEST] 신용카드 복합과세-팝업-okUrl",
    payOptions: { cn_bill_type: "20" },
  },
];

export const ALL_CASES: TestCase[] = [...MC_CASES, ...CN_CASES];

export function getCaseById(id: string): TestCase | undefined {
  return ALL_CASES.find((c) => c.id === id);
}
