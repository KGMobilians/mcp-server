import { createHmac } from "node:crypto";

/**
 * HMAC-SHA256 생성 (거래등록/인증/승인용)
 * message = amount + ok_url + trade_id + time_stamp
 */
export function generateHmac(
  skey: string,
  amount: string,
  okUrl: string,
  tradeId: string,
  timeStamp: string,
): string {
  const message = amount + okUrl + tradeId + timeStamp;
  return createHmac("sha256", skey).update(message).digest("base64");
}

/**
 * 수신된 HMAC 검증
 */
export function verifyHmac(
  skey: string,
  receivedHmac: string,
  amount: string,
  okUrl: string,
  tradeId: string,
  timeStamp: string,
): boolean {
  const expected = generateHmac(skey, amount, okUrl, tradeId, timeStamp);
  return receivedHmac === expected;
}
