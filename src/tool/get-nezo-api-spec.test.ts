import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { callTool, getTestClient, cleanupTestClient } from "../__test-helpers__/mcp-test-client.js";

beforeAll(() => getTestClient());
afterAll(() => cleanupTestClient());

describe("get-nezo-api-spec", () => {
  it("'send' — 결제요청 문서", async () => {
    const text = await callTool("get-nezo-api-spec", { api_name: "send" });
    expect(text).toContain("nezo/api/send.md");
    expect(text.length).toBeGreaterThan(200);
  });

  it("한글 '결제요청' — 동일 문서", async () => {
    const text = await callTool("get-nezo-api-spec", { api_name: "결제요청" });
    expect(text).toContain("nezo/api/send.md");
  });

  it("'callback' — 콜백 문서", async () => {
    const text = await callTool("get-nezo-api-spec", { api_name: "callback" });
    expect(text).toContain("nezo/api/callback.md");
  });

  it("'mac' — MAC 가이드", async () => {
    const text = await callTool("get-nezo-api-spec", { api_name: "mac" });
    expect(text).toContain("nezo/reference/mac-guide.md");
  });

  it("'search' — 결제조회 문서", async () => {
    const text = await callTool("get-nezo-api-spec", { api_name: "search" });
    expect(text).toContain("nezo/api/search.md");
  });

  it("'nezo-cancel' — 취소 문서", async () => {
    const text = await callTool("get-nezo-api-spec", { api_name: "nezo-cancel" });
    expect(text).toContain("nezo/api/cancel.md");
  });

  it("'start' — 시작하기 가이드", async () => {
    const text = await callTool("get-nezo-api-spec", { api_name: "start" });
    expect(text).toContain("nezo/guides/start.md");
  });

  it("미존재 이름 — 사용 가능 목록 안내", async () => {
    const text = await callTool("get-nezo-api-spec", { api_name: "invalid_api" });
    expect(text).toContain("찾을 수 없습니다");
    expect(text).toContain("사용 가능한");
  });
});
