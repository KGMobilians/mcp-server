import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestClient, cleanupTestClient, callTool } from "../__test-helpers__/mcp-test-client.js";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

let client: Client;

beforeAll(async () => {
  client = await getTestClient();
});
afterAll(() => cleanupTestClient());

const EXPECTED_TOOLS = [
  "get-docs",
  "document-by-id",
  "get-payment-api-spec",
  "get-payment-code-example",
  "get-nezo-api-spec",
  "get-nezo-code-example",
];

describe("MCP 프로토콜 E2E", () => {
  describe("tools/list", () => {
    it("정확히 6개 도구가 등록됨", async () => {
      const { tools } = await client.listTools();
      expect(tools).toHaveLength(6);
    });

    it("모든 도구 이름이 올바름", async () => {
      const { tools } = await client.listTools();
      const names = tools.map((t) => t.name).sort();
      expect(names).toEqual(EXPECTED_TOOLS.sort());
    });

    it("모든 도구에 description이 있음", async () => {
      const { tools } = await client.listTools();
      for (const tool of tools) {
        expect(tool.description, `${tool.name}에 description 필요`).toBeTruthy();
      }
    });

    it("모든 도구에 inputSchema가 있음", async () => {
      const { tools } = await client.listTools();
      for (const tool of tools) {
        expect(tool.inputSchema, `${tool.name}에 inputSchema 필요`).toBeDefined();
        expect(tool.inputSchema.type).toBe("object");
      }
    });
  });

  describe("도구 호출 응답 형식", () => {
    it("정상 호출 — content 배열 반환", async () => {
      const result = await client.callTool({
        name: "document-by-id",
        arguments: { id: 0 },
      });
      expect(result.content).toBeInstanceOf(Array);
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content.length).toBeGreaterThan(0);
      expect(content[0].type).toBe("text");
      expect(content[0].text).toBeTruthy();
    });

    it("get-docs 호출 — 검색 결과 형식", async () => {
      const result = await client.callTool({
        name: "get-docs",
        arguments: { keywords: ["거래등록"] },
      });
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain("score:");
    });
  });

  describe("에러 처리", () => {
    it("필수 파라미터 누락 — isError 응답", async () => {
      const result = await client.callTool({ name: "get-docs", arguments: {} });
      expect(result.isError).toBe(true);
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain("invalid");
    });

    it("잘못된 타입 — isError 응답", async () => {
      const result = await client.callTool({ name: "document-by-id", arguments: { id: "not-a-number" } });
      expect(result.isError).toBe(true);
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content[0].text).toContain("Expected number");
    });
  });
});
