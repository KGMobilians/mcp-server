import { describe, it, expect } from "vitest";
import { generateHmac, verifyHmac } from "./hmac.js";

// 문서 예제 기반 픽스처
const FIXTURE = {
  skey: "test-service-key",
  amount: 1000,
  okUrl: "https://www.example.com/payment/result",
  tradeId: "ORDER_20250704_001",
  timeStamp: "20190401090010",
};

describe("generateHmac", () => {
  it("동일 입력에 대해 항상 같은 값을 반환한다", () => {
    const { skey, amount, okUrl, tradeId, timeStamp } = FIXTURE;
    const a = generateHmac(amount, okUrl, tradeId, timeStamp, skey);
    const b = generateHmac(amount, okUrl, tradeId, timeStamp, skey);
    expect(a).toBe(b);
  });

  it("Base64 인코딩된 문자열을 반환한다", () => {
    const { skey, amount, okUrl, tradeId, timeStamp } = FIXTURE;
    const result = generateHmac(amount, okUrl, tradeId, timeStamp, skey);
    expect(result).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});

describe("verifyHmac", () => {
  it("올바른 hmac은 검증을 통과한다", () => {
    const { skey, amount, okUrl, tradeId, timeStamp } = FIXTURE;
    const hmac = generateHmac(amount, okUrl, tradeId, timeStamp, skey);
    expect(verifyHmac({ receivedHmac: hmac, amount, okUrl, tradeId, timeStamp, skey })).toBe(true);
  });

  it("위변조된 금액은 검증에 실패한다", () => {
    const { skey, amount, okUrl, tradeId, timeStamp } = FIXTURE;
    const hmac = generateHmac(amount, okUrl, tradeId, timeStamp, skey);
    expect(verifyHmac({ receivedHmac: hmac, amount: 9999, okUrl, tradeId, timeStamp, skey })).toBe(false);
  });

  it("잘못된 skey는 검증에 실패한다", () => {
    const { amount, okUrl, tradeId, timeStamp } = FIXTURE;
    const hmac = generateHmac(amount, okUrl, tradeId, timeStamp, "correct-key");
    expect(verifyHmac({ receivedHmac: hmac, amount, okUrl, tradeId, timeStamp, skey: "wrong-key" })).toBe(false);
  });

  it("길이가 다른 hmac은 검증에 실패한다", () => {
    const { skey, amount, okUrl, tradeId, timeStamp } = FIXTURE;
    expect(verifyHmac({ receivedHmac: "invalid", amount, okUrl, tradeId, timeStamp, skey })).toBe(false);
  });
});
