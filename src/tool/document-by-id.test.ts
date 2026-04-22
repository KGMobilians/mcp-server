import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { callTool, getTestClient, cleanupTestClient } from "../__test-helpers__/mcp-test-client.js";

beforeAll(() => getTestClient());
afterAll(() => cleanupTestClient());

describe("document-by-id", () => {
  it("id=0 — 문서 목록 반환 (27개)", async () => {
    const text = await callTool("document-by-id", { id: 0 });
    expect(text).toContain("총 27개");
  });

  it("id=1 — 첫 번째 문서 내용 반환", async () => {
    const text = await callTool("document-by-id", { id: 1 });
    expect(text).toContain("[ID:1]");
    expect(text.length).toBeGreaterThan(100);
  });

  it("id=27 — 마지막 문서 내용 반환", async () => {
    const text = await callTool("document-by-id", { id: 27 });
    expect(text).toContain("[ID:27]");
  });

  it("id=999 — 에러 메시지", async () => {
    const text = await callTool("document-by-id", { id: 999 });
    expect(text).toContain("해당하는 문서가 없습니다");
    expect(text).toContain("1~27");
  });

  it("id=-1 — 에러 메시지", async () => {
    const text = await callTool("document-by-id", { id: -1 });
    expect(text).toContain("해당하는 문서가 없습니다");
  });
});
