import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { callTool, getTestClient, cleanupTestClient } from "../__test-helpers__/mcp-test-client.js";

beforeAll(() => getTestClient());
afterAll(() => cleanupTestClient());

describe("NEZO 개발자 시나리오 QA", () => {
  describe("시나리오 1: 알림톡 결제요청 연동", () => {
    let text: string;
    beforeAll(async () => {
      text = await callTool("get-nezo-api-spec", { api_name: "send" });
    });

    it("/send 엔드포인트 정보 포함", () => {
      expect(text).toMatch(/\/send|send/i);
    });

    it("svc_id 파라미터 포함", () => {
      expect(text).toContain("svc_id");
    });

    it("수신자 전화번호 파라미터 포함", () => {
      expect(text).toMatch(/recv_hp|전화번호|핸드폰/i);
    });

    it("결제금액 파라미터 포함", () => {
      expect(text).toMatch(/amount|금액|pay_amt/i);
    });
  });

  describe("시나리오 2: 콜백 핸들러 구현", () => {
    let text: string;
    beforeAll(async () => {
      text = await callTool("get-nezo-api-spec", { api_name: "callback" });
    });

    it("callback_url 관련 내용 포함", () => {
      expect(text).toMatch(/callback_url|callback|콜백/i);
    });

    it("trade_no 파라미터 포함", () => {
      expect(text).toContain("trade_no");
    });

    it("결제 결과 처리 방법 포함", () => {
      expect(text).toMatch(/result_cd|결과|응답/i);
    });
  });

  describe("시나리오 3: MAC 생성 Java 코드 구현", () => {
    let text: string;
    beforeAll(async () => {
      text = await callTool("get-nezo-code-example", { api_name: "mac", language: "java" });
    });

    it("Java 코드 블록 포함", () => {
      expect(text).toContain("```java");
    });

    it("HmacSHA256 관련 로직 포함", () => {
      expect(text).toMatch(/hmac|HmacSHA256|sha256/i);
    });
  });

  describe("시나리오 4: 결제 조회", () => {
    let text: string;
    beforeAll(async () => {
      text = await callTool("get-nezo-api-spec", { api_name: "search" });
    });

    it("/send/view 엔드포인트 포함", () => {
      expect(text).toMatch(/\/send\/view|조회/i);
    });

    it("조회 파라미터 포함", () => {
      expect(text).toMatch(/svc_id|trade_no/i);
    });
  });

  describe("시나리오 5: 결제 취소", () => {
    let text: string;
    beforeAll(async () => {
      text = await callTool("get-nezo-api-spec", { api_name: "nezo-cancel" });
    });

    it("취소 관련 내용 포함", () => {
      expect(text).toMatch(/취소|cancel/i);
    });

    it("취소 파라미터 포함", () => {
      expect(text).toMatch(/trade_no|pay_no|svc_id/i);
    });
  });

  describe("시나리오 6: 시작하기 가이드 조회", () => {
    let text: string;
    beforeAll(async () => {
      text = await callTool("get-nezo-api-spec", { api_name: "start" });
    });

    it("서비스 개요 포함", () => {
      expect(text).toMatch(/내죠여왕|NEZO|알림톡/i);
    });

    it("접속 정보 포함", () => {
      expect(text).toMatch(/test\.mpps\.co\.kr|nezo\.co\.kr|호스트|host/i);
    });
  });

  describe("시나리오 7: 통합 검색으로 MAC 관련 정보 찾기", () => {
    let text: string;
    beforeAll(async () => {
      text = await callTool("get-docs", { keywords: ["MAC", "생성", "검증"] });
    });

    it("MAC 관련 검색 결과 반환", () => {
      expect(text).toMatch(/mac|MAC/);
    });

    it("NEZO 문서가 결과에 포함", () => {
      expect(text).toContain("nezo/");
    });
  });
});
