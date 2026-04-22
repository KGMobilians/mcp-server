import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { callTool, getTestClient, cleanupTestClient } from "../__test-helpers__/mcp-test-client.js";

beforeAll(() => getTestClient());
afterAll(() => cleanupTestClient());

describe("get-docs", () => {
  it("한글 키워드 검색 — '거래등록'", async () => {
    const text = await callTool("get-docs", { keywords: ["거래등록"] });
    expect(text).toContain("registration");
    expect(text).toContain("score:");
  });

  it("영문 키워드 검색 — 'hmac'", async () => {
    const text = await callTool("get-docs", { keywords: ["hmac"] });
    expect(text).toMatch(/hmac/i);
  });

  it("복합 키워드 — NEZO 문서 우선", async () => {
    const text = await callTool("get-docs", { keywords: ["알림톡", "결제요청"] });
    expect(text).toContain("nezo/");
  });

  it("존재하지 않는 키워드 — 결과 없음", async () => {
    const text = await callTool("get-docs", { keywords: ["xyzabc123nonexistent"] });
    expect(text).toContain("검색 결과가 없습니다");
  });

  it("서비스 구분 — svc_id 키워드는 NEZO 문서 반환", async () => {
    const text = await callTool("get-docs", { keywords: ["svc_id"] });
    expect(text).toContain("nezo/");
  });
});
