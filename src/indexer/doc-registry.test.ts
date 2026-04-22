import { describe, it, expect, beforeAll } from "vitest";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildRegistry,
  resolvePaymentApiName,
  resolveNezoApiName,
  listDocuments,
  getDocumentById,
} from "./doc-registry.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MD_DIR = join(__dirname, "..", "..", "md");

beforeAll(async () => {
  await buildRegistry();
});

describe("buildRegistry / listDocuments", () => {
  it("27개 문서가 등록됨", () => {
    const docs = listDocuments();
    expect(docs.length).toBe(27);
  });

  it("모든 문서에 id, title, path, description이 있음", () => {
    for (const doc of listDocuments()) {
      expect(doc.id).toBeGreaterThan(0);
      expect(doc.title).toBeTruthy();
      expect(doc.path).toBeTruthy();
      expect(doc.description).toBeTruthy();
    }
  });

  it("getDocumentById로 조회 가능", () => {
    expect(getDocumentById(1)).toBeDefined();
    expect(getDocumentById(999)).toBeUndefined();
  });
});

describe("resolvePaymentApiName", () => {
  it("영문 정확 매치", () => {
    expect(resolvePaymentApiName("registration")).toBe("payment/api/registration.md");
    expect(resolvePaymentApiName("cancel")).toBe("payment/api/cancel.md");
    expect(resolvePaymentApiName("hmac")).toBe("payment/api/hmac.md");
  });

  it("한글 정확 매치", () => {
    expect(resolvePaymentApiName("거래등록")).toBe("payment/api/registration.md");
    expect(resolvePaymentApiName("결제취소")).toBe("payment/api/cancel.md");
    expect(resolvePaymentApiName("현금영수증")).toBe("payment/api/cash-receipt.md");
  });

  it("대소문자 무시", () => {
    expect(resolvePaymentApiName("Registration")).toBe("payment/api/registration.md");
    expect(resolvePaymentApiName("HMAC")).toBe("payment/api/hmac.md");
  });

  it("구분자 정규화 (하이픈/언더스코어/공백)", () => {
    expect(resolvePaymentApiName("approval-tid")).toBe("payment/api/approval-tid.md");
    expect(resolvePaymentApiName("approval_tid")).toBe("payment/api/approval-tid.md");
    expect(resolvePaymentApiName("noti-url")).toBe("payment/guides/noti-url.md");
    expect(resolvePaymentApiName("noti_url")).toBe("payment/guides/noti-url.md");
  });

  it("가이드/레퍼런스 문서도 해석", () => {
    expect(resolvePaymentApiName("flow-normal")).toBe("payment/guides/flow-normal.md");
    expect(resolvePaymentApiName("하이브리드")).toBe("payment/guides/flow-hybrid.md");
    expect(resolvePaymentApiName("에러코드")).toBe("payment/reference/error-codes.md");
    expect(resolvePaymentApiName("코드표")).toBe("payment/reference/payment-codes.md");
  });

  it("미존재 이름은 undefined", () => {
    expect(resolvePaymentApiName("nonexistent")).toBeUndefined();
  });

  it("NEZO 전용 이름은 해석하지 않음 (교차 서비스 격리)", () => {
    expect(resolvePaymentApiName("send")).toBeUndefined();
    expect(resolvePaymentApiName("callback")).toBeUndefined();
  });
});

describe("resolveNezoApiName", () => {
  it("영문 정확 매치", () => {
    expect(resolveNezoApiName("send")).toBe("nezo/api/send.md");
    expect(resolveNezoApiName("callback")).toBe("nezo/api/callback.md");
    expect(resolveNezoApiName("search")).toBe("nezo/api/search.md");
    expect(resolveNezoApiName("resend")).toBe("nezo/api/resend.md");
  });

  it("한글 정확 매치", () => {
    expect(resolveNezoApiName("결제요청")).toBe("nezo/api/send.md");
    expect(resolveNezoApiName("콜백")).toBe("nezo/api/callback.md");
    expect(resolveNezoApiName("재요청")).toBe("nezo/api/resend.md");
  });

  it("MAC 가이드 해석", () => {
    expect(resolveNezoApiName("mac")).toBe("nezo/reference/mac-guide.md");
    expect(resolveNezoApiName("mac검증")).toBe("nezo/reference/mac-guide.md");
  });

  it("NEZO 취소는 nezo-cancel로 해석", () => {
    expect(resolveNezoApiName("nezo-cancel")).toBe("nezo/api/cancel.md");
    expect(resolveNezoApiName("내죠취소")).toBe("nezo/api/cancel.md");
  });

  it("미존재 이름은 undefined", () => {
    expect(resolveNezoApiName("nonexistent")).toBeUndefined();
  });

  it("MOBILPAY 전용 이름은 해석하지 않음", () => {
    expect(resolveNezoApiName("registration")).toBeUndefined();
    expect(resolveNezoApiName("approval-tid")).toBeUndefined();
  });
});

describe("맵 키 → 파일 존재 검증", () => {
  it("PAYMENT_API_NAME_MAP의 모든 경로가 실제 파일을 가리킴", () => {
    const paymentNames = [
      "registration", "거래등록", "payment-window", "결제창",
      "auth-response", "approval-tid", "approval-mobilid",
      "purchase", "virtual-account", "cancel", "결제취소",
      "refund", "환불", "cash-receipt", "현금영수증", "hmac",
      "flow-normal", "flow-hybrid", "noti-url", "firewall",
      "integration-guide", "error-codes", "payment-codes",
    ];
    for (const name of paymentNames) {
      const path = resolvePaymentApiName(name);
      expect(path, `'${name}'이 해석되어야 함`).toBeDefined();
      expect(existsSync(join(MD_DIR, path!)), `${path} 파일이 존재해야 함`).toBe(true);
    }
  });

  it("NEZO_API_NAME_MAP의 모든 경로가 실제 파일을 가리킴", () => {
    const nezoNames = [
      "send", "결제요청", "callback", "콜백", "search", "결제조회",
      "nezo-cancel", "내죠취소", "resend", "재요청",
      "start", "시작하기", "mac", "mac검증", "응답코드", "내죠방화벽",
    ];
    for (const name of nezoNames) {
      const path = resolveNezoApiName(name);
      expect(path, `'${name}'이 해석되어야 함`).toBeDefined();
      expect(existsSync(join(MD_DIR, path!)), `${path} 파일이 존재해야 함`).toBe(true);
    }
  });
});
