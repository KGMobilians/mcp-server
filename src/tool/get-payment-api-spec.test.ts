import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { callTool, getTestClient, cleanupTestClient } from "../__test-helpers__/mcp-test-client.js";

beforeAll(() => getTestClient());
afterAll(() => cleanupTestClient());

describe("get-payment-api-spec", () => {
  it("영문 이름 'registration' — 거래등록 문서", async () => {
    const text = await callTool("get-payment-api-spec", { api_name: "registration" });
    expect(text).toContain("payment/api/registration.md");
    expect(text.length).toBeGreaterThan(200);
  });

  it("한글 이름 '거래등록' — 동일 문서", async () => {
    const text = await callTool("get-payment-api-spec", { api_name: "거래등록" });
    expect(text).toContain("payment/api/registration.md");
  });

  it("'cancel' — 결제취소 문서 (cancellation.md 로 해석)", async () => {
    const text = await callTool("get-payment-api-spec", { api_name: "cancel" });
    expect(text).toContain("payment/api/cancellation.md");
  });

  it("'cancellation' — 결제취소 문서", async () => {
    const text = await callTool("get-payment-api-spec", { api_name: "cancellation" });
    expect(text).toContain("payment/api/cancellation.md");
  });

  it("'escrow-delivery' — 에스크로 배송등록 문서", async () => {
    const text = await callTool("get-payment-api-spec", { api_name: "escrow-delivery" });
    expect(text).toContain("payment/api/escrow-delivery.md");
  });

  it("'hmac' — HMAC 검증 문서", async () => {
    const text = await callTool("get-payment-api-spec", { api_name: "hmac" });
    expect(text).toContain("payment/api/hmac.md");
    expect(text).toMatch(/hmac|HMAC/i);
  });

  it("미존재 이름 — 사용 가능 목록 안내", async () => {
    const text = await callTool("get-payment-api-spec", { api_name: "invalid_api" });
    expect(text).toContain("찾을 수 없습니다");
    expect(text).toContain("사용 가능한");
  });

  it("가이드 문서 'noti-url' 조회", async () => {
    const text = await callTool("get-payment-api-spec", { api_name: "noti-url" });
    expect(text).toContain("payment/guides/noti-url.md");
  });

  it("레퍼런스 'error-codes' 조회", async () => {
    const text = await callTool("get-payment-api-spec", { api_name: "error-codes" });
    expect(text).toContain("payment/reference/error-codes.md");
  });
});
