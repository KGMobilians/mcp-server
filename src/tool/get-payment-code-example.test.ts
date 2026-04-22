import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { callTool, getTestClient, cleanupTestClient } from "../__test-helpers__/mcp-test-client.js";

beforeAll(() => getTestClient());
afterAll(() => cleanupTestClient());

describe("get-payment-code-example", () => {
  it("HMAC Java 예제", async () => {
    const text = await callTool("get-payment-code-example", { api_name: "hmac", language: "java" });
    expect(text).toContain("```java");
    expect(text).toContain("코드 예제");
  });

  it("HMAC Python 예제", async () => {
    const text = await callTool("get-payment-code-example", { api_name: "hmac", language: "python" });
    expect(text).toContain("```python");
  });

  it("별칭 'node' → JavaScript 예제", async () => {
    const text = await callTool("get-payment-code-example", { api_name: "hmac", language: "node" });
    expect(text).toMatch(/```(javascript|js|node)/);
  });

  it("별칭 'py' → Python 예제", async () => {
    const text = await callTool("get-payment-code-example", { api_name: "hmac", language: "py" });
    expect(text).toContain("```python");
  });

  it("별칭 'csharp' → C# 예제", async () => {
    const text = await callTool("get-payment-code-example", { api_name: "hmac", language: "csharp" });
    expect(text).toMatch(/```csharp/);
  });

  it("언어 필터 없이 — 전체 코드 블록", async () => {
    const text = await callTool("get-payment-code-example", { api_name: "hmac" });
    expect(text).toContain("코드 예제");
    // 여러 언어 포함
    expect(text).toContain("```java");
    expect(text).toContain("```python");
  });

  it("코드 없는 문서 — 안내 메시지", async () => {
    const text = await callTool("get-payment-code-example", { api_name: "error-codes", language: "java" });
    expect(text).toMatch(/코드 예제가 없습니다|언어 예제가 없습니다/);
  });

  it("미지원 언어 — 사용 가능 언어 안내", async () => {
    const text = await callTool("get-payment-code-example", { api_name: "hmac", language: "rust" });
    expect(text).toContain("사용 가능한 언어");
  });

  it("미존재 API — 사용 가능 문서 목록", async () => {
    const text = await callTool("get-payment-code-example", { api_name: "invalid_api" });
    expect(text).toContain("찾을 수 없습니다");
  });
});
