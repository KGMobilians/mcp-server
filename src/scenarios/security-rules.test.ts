import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestClient, cleanupTestClient, callTool } from "../__test-helpers__/mcp-test-client.js";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

let client: Client;

beforeAll(async () => {
  client = await getTestClient();
});
afterAll(() => cleanupTestClient());

describe("보안 규칙 검증", () => {
  describe("도구 설명(description)의 보안 규칙", () => {
    let tools: Array<{ name: string; description?: string }>;
    beforeAll(async () => {
      const result = await client.listTools();
      tools = result.tools;
    });

    it("MOBILPAY 도구에 skey 보호 규칙 포함", () => {
      const paymentTools = tools.filter((t) =>
        t.name.includes("payment") || t.name === "get-docs",
      );
      for (const tool of paymentTools) {
        expect(tool.description, `${tool.name}: skey 보안 규칙 필요`).toMatch(/skey/i);
      }
    });

    it("NEZO 도구에 MAC_KEY 보호 규칙 포함", () => {
      const nezoTools = tools.filter((t) => t.name.includes("nezo"));
      for (const tool of nezoTools) {
        expect(tool.description, `${tool.name}: MAC_KEY 보안 규칙 필요`).toMatch(/MAC_KEY|mac_key/);
      }
    });

    it("MOBILPAY 도구에 환경변수 로드 안내 포함", () => {
      const paymentTools = tools.filter((t) =>
        t.name.includes("payment") || t.name === "get-docs",
      );
      for (const tool of paymentTools) {
        expect(tool.description, `${tool.name}: 환경변수 안내 필요`).toMatch(/환경변수/);
      }
    });

    it("NEZO 도구에 환경변수 로드 안내 포함", () => {
      const nezoTools = tools.filter((t) => t.name.includes("nezo"));
      for (const tool of nezoTools) {
        expect(tool.description, `${tool.name}: 환경변수 안내 필요`).toMatch(/환경변수/);
      }
    });

    it("서버 사이드 처리 강조 — MOBILPAY", () => {
      const paymentTools = tools.filter((t) =>
        t.name.includes("payment") || t.name === "get-docs",
      );
      for (const tool of paymentTools) {
        expect(tool.description, `${tool.name}: 서버 사이드 안내 필요`).toMatch(/서버.*사이드|백엔드|서버에서/);
      }
    });

    it("서버 사이드 처리 강조 — NEZO", () => {
      const nezoTools = tools.filter((t) => t.name.includes("nezo"));
      for (const tool of nezoTools) {
        expect(tool.description, `${tool.name}: 서버 사이드 안내 필요`).toMatch(/서버.*사이드|백엔드|서버에서/);
      }
    });
  });

  describe("문서 내 보안 관련 내용 검증", () => {
    it("HMAC 문서 — 서버 사이드 처리 안내", async () => {
      const text = await callTool("get-payment-api-spec", { api_name: "hmac" });
      expect(text).toMatch(/서버|server|백엔드|backend/i);
    });

    it("MAC 가이드 — 서버 사이드 처리 안내", async () => {
      const text = await callTool("get-nezo-api-spec", { api_name: "mac" });
      expect(text).toMatch(/서버|server|백엔드|backend/i);
    });

    it("noti_url 문서 — 멱등성/중복 체크 안내", async () => {
      const text = await callTool("get-payment-api-spec", { api_name: "noti-url" });
      expect(text).toMatch(/tid|중복|멱등|idempoten/i);
    });

    it("callback 문서 — trade_no 기반 중복 체크 안내", async () => {
      const text = await callTool("get-nezo-api-spec", { api_name: "callback" });
      expect(text).toContain("trade_no");
    });
  });

  describe("테스트/운영 호스트 구분", () => {
    it("MOBILPAY 문서에 테스트/운영 호스트 모두 포함", async () => {
      const text = await callTool("get-payment-api-spec", { api_name: "registration" });
      expect(text).toMatch(/test\.mobilians\.co\.kr|테스트/i);
      expect(text).toMatch(/mup\.mobilians\.co\.kr|운영/i);
    });

    it("NEZO 시작하기 문서에 테스트/운영 호스트 포함", async () => {
      const text = await callTool("get-nezo-api-spec", { api_name: "start" });
      expect(text).toMatch(/test\.mpps\.co\.kr|테스트/i);
      expect(text).toMatch(/nezo\.co\.kr|운영/i);
    });
  });
});
