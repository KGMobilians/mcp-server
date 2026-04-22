import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { callTool, getTestClient, cleanupTestClient } from "../__test-helpers__/mcp-test-client.js";

beforeAll(() => getTestClient());
afterAll(() => cleanupTestClient());

describe("MOBILPAY 개발자 시나리오 QA", () => {
  describe("시나리오 1: 결제 연동 시작 — 거래등록 API", () => {
    let text: string;
    beforeAll(async () => {
      text = await callTool("get-payment-api-spec", { api_name: "registration" });
    });

    it("API 엔드포인트가 포함됨", () => {
      expect(text).toMatch(/\/MUP\/api\/registration|registration/i);
    });

    it("필수 파라미터 sid가 포함됨", () => {
      expect(text).toMatch(/sid/i);
    });

    it("결제수단 코드(cash_code) 정보 포함", () => {
      expect(text).toMatch(/cash_code/i);
    });
  });

  describe("시나리오 2: HMAC 검증 Python 코드 구현", () => {
    let text: string;
    beforeAll(async () => {
      text = await callTool("get-payment-code-example", { api_name: "hmac", language: "python" });
    });

    it("Python 코드 블록이 포함됨", () => {
      expect(text).toContain("```python");
    });

    it("HMAC/SHA256 로직이 포함됨", () => {
      expect(text).toMatch(/hmac|sha256|HmacSHA256/i);
    });
  });

  describe("시나리오 3: 하이브리드 결제 플로우 이해", () => {
    let text: string;
    beforeAll(async () => {
      text = await callTool("get-payment-api-spec", { api_name: "flow-hybrid" });
    });

    it("하이브리드 관련 내용 포함", () => {
      expect(text).toMatch(/하이브리드|hybrid/i);
    });

    it("승인 단계 설명 포함", () => {
      expect(text).toMatch(/승인|approval/i);
    });
  });

  describe("시나리오 4: noti_url 핸들러 구현", () => {
    let text: string;
    beforeAll(async () => {
      text = await callTool("get-payment-api-spec", { api_name: "noti-url" });
    });

    it("noti_url 처리 방법 포함", () => {
      expect(text).toMatch(/noti_url|noti/i);
    });

    it("tid 기반 멱등성/중복 체크 안내", () => {
      expect(text).toMatch(/tid|중복|멱등/i);
    });

    it("응답 처리 규칙 포함 (SUCCESS/FAIL 등)", () => {
      expect(text).toMatch(/SUCCESS|FAIL|OK|성공|실패/i);
    });
  });

  describe("시나리오 5: 결제 취소 처리", () => {
    let text: string;
    beforeAll(async () => {
      text = await callTool("get-payment-api-spec", { api_name: "cancel" });
    });

    it("취소 관련 파라미터 포함", () => {
      expect(text).toMatch(/cancel_type|취소/i);
    });

    it("API 엔드포인트 정보 포함", () => {
      expect(text).toMatch(/\/MUP\/api\/cancel|cancel/i);
    });
  });

  describe("시나리오 6: 에러코드 조회", () => {
    let text: string;
    beforeAll(async () => {
      text = await callTool("get-payment-api-spec", { api_name: "error-codes" });
    });

    it("에러코드 테이블/목록 포함", () => {
      expect(text.length).toBeGreaterThan(500);
      expect(text).toMatch(/에러|error|코드|code/i);
    });
  });

  describe("시나리오 7: 결제창 호출 방법", () => {
    let text: string;
    beforeAll(async () => {
      text = await callTool("get-payment-api-spec", { api_name: "payment-window" });
    });

    it("결제창 호출 방식 포함 (popup/iframe 등)", () => {
      expect(text).toMatch(/결제창|payment.*window|popup|iframe/i);
    });
  });

  describe("시나리오 8: 가상계좌 처리", () => {
    let text: string;
    beforeAll(async () => {
      text = await callTool("get-payment-api-spec", { api_name: "virtual-account" });
    });

    it("가상계좌 관련 내용 포함", () => {
      expect(text).toMatch(/가상계좌|virtual.*account|vbank/i);
    });
  });
});
