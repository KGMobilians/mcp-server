import { createHmac, timingSafeEqual } from "crypto";

export interface HmacVerifyParams {
  /** 거래 등록 응답의 hmac 값 */
  receivedHmac: string;
  /** 결제 총 금액 */
  amount: number;
  /** 결제 결과 수신 URL */
  okUrl: string;
  /** 가맹점 거래번호 */
  tradeId: string;
  /** 거래 등록 응답의 time_stamp 값 */
  timeStamp: string;
  /** 서비스키 (환경변수에서 로드, 절대 클라이언트에 노출 금지) */
  skey: string;
}

/**
 * MOBILPAY HMAC-SHA256 서명을 생성합니다.
 * message = amount(total) + ok_url + trade_id + time_stamp
 */
export function generateHmac(
  amount: number,
  okUrl: string,
  tradeId: string,
  timeStamp: string,
  skey: string
): string {
  const message = String(amount) + okUrl + tradeId + timeStamp;
  return createHmac("sha256", skey).update(message, "utf8").digest("base64");
}

/**
 * 거래 등록 응답의 HMAC 무결성을 검증합니다.
 * 타이밍 공격 방지를 위해 timingSafeEqual을 사용합니다.
 *
 * @returns true: 검증 성공, false: 검증 실패 (데이터 위변조 의심)
 */
export function verifyHmac(params: HmacVerifyParams): boolean {
  const { receivedHmac, amount, okUrl, tradeId, timeStamp, skey } = params;

  const expected = generateHmac(amount, okUrl, tradeId, timeStamp, skey);

  const expectedBuf = Buffer.from(expected, "base64");
  const receivedBuf = Buffer.from(receivedHmac, "base64");

  // 길이가 다르면 즉시 false (timingSafeEqual은 동일 길이 필요)
  if (expectedBuf.length !== receivedBuf.length) {
    return false;
  }

  return timingSafeEqual(expectedBuf, receivedBuf);
}
