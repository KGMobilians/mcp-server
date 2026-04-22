import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MD_DIR = join(__dirname, "..", "..", "md");

export interface DocEntry {
  id: number;
  title: string;
  path: string;
  description: string;
}

/* ── MOBILPAY REST API 결제연동 ── */
const PAYMENT_API_NAME_MAP: Record<string, string> = {
  "registration": "payment/api/registration.md",
  "거래등록": "payment/api/registration.md",
  "payment-window": "payment/api/payment-window.md",
  "결제창": "payment/api/payment-window.md",
  "auth-response": "payment/api/auth-response.md",
  "인증응답": "payment/api/auth-response.md",
  "승인응답": "payment/api/auth-response.md",
  "approval-tid": "payment/api/approval-tid.md",
  "결제승인": "payment/api/approval-tid.md",
  "승인tid": "payment/api/approval-tid.md",
  "approval-mobilid": "payment/api/approval-mobilid.md",
  "승인mobilid": "payment/api/approval-mobilid.md",
  "purchase": "payment/api/purchase.md",
  "수동매입": "payment/api/purchase.md",
  "virtual-account": "payment/api/virtual-account.md",
  "가상계좌": "payment/api/virtual-account.md",
  "cancel": "payment/api/cancel.md",
  "결제취소": "payment/api/cancel.md",
  "취소": "payment/api/cancel.md",
  "refund": "payment/api/refund.md",
  "환불": "payment/api/refund.md",
  "cash-receipt": "payment/api/cash-receipt.md",
  "현금영수증": "payment/api/cash-receipt.md",
  "hmac": "payment/api/hmac.md",
  "flow-normal": "payment/guides/flow-normal.md",
  "일반결제": "payment/guides/flow-normal.md",
  "flow-hybrid": "payment/guides/flow-hybrid.md",
  "하이브리드": "payment/guides/flow-hybrid.md",
  "noti-url": "payment/guides/noti-url.md",
  "noti_url": "payment/guides/noti-url.md",
  "firewall": "payment/guides/firewall.md",
  "방화벽": "payment/guides/firewall.md",
  "integration-guide": "payment/guides/integration-guide.md",
  "적용가이드": "payment/guides/integration-guide.md",
  "error-codes": "payment/reference/error-codes.md",
  "에러코드": "payment/reference/error-codes.md",
  "payment-codes": "payment/reference/payment-codes.md",
  "코드표": "payment/reference/payment-codes.md",
};

/* ── 내죠여왕(NEZO) 알림톡 결제서비스 ── */
const NEZO_API_NAME_MAP: Record<string, string> = {
  "send": "nezo/api/send.md",
  "결제요청": "nezo/api/send.md",
  "알림톡결제": "nezo/api/send.md",
  "알림톡": "nezo/api/send.md",
  "callback": "nezo/api/callback.md",
  "콜백": "nezo/api/callback.md",
  "return_url": "nezo/api/callback.md",
  "callback_url": "nezo/api/callback.md",
  "search": "nezo/api/search.md",
  "결제조회": "nezo/api/search.md",
  "조회": "nezo/api/search.md",
  "nezo-cancel": "nezo/api/cancel.md",
  "내죠취소": "nezo/api/cancel.md",
  "resend": "nezo/api/resend.md",
  "재요청": "nezo/api/resend.md",
  "재발송": "nezo/api/resend.md",
  "start": "nezo/guides/start.md",
  "시작하기": "nezo/guides/start.md",
  "내죠여왕": "nezo/guides/start.md",
  "nezo": "nezo/guides/start.md",
  "mac": "nezo/reference/mac-guide.md",
  "mac검증": "nezo/reference/mac-guide.md",
  "mac가이드": "nezo/reference/mac-guide.md",
  "응답코드": "nezo/reference/response-codes.md",
  "result_cd": "nezo/reference/response-codes.md",
  "내죠방화벽": "nezo/guides/firewall.md",
};

let registry: DocEntry[] = [];

export async function buildRegistry(): Promise<void> {
  const llmsTxt = await readFile(join(MD_DIR, "llms.txt"), "utf-8");
  registry = [];

  let id = 1;
  for (const line of llmsTxt.split("\n")) {
    const match = line.match(/^- \[(.+?)\]\((.+?)\):\s*(.+)$/);
    if (match) {
      const [, title, rawPath, description] = match;
      const path = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath;
      registry.push({ id, title, path, description });
      id++;
    }
  }
}

export function listDocuments(): DocEntry[] {
  return registry;
}

export function getDocumentById(id: number): DocEntry | undefined {
  return registry.find((d) => d.id === id);
}

function resolveFromMap(
  apiName: string,
  nameMap: Record<string, string>,
): string | undefined {
  const key = apiName.toLowerCase().replace(/[\s_-]+/g, "").replace("api", "");
  for (const [k, v] of Object.entries(nameMap)) {
    if (k.replace(/[\s_-]+/g, "") === key) return v;
  }
  // Fuzzy: check if apiName is substring of any key
  for (const [k, v] of Object.entries(nameMap)) {
    if (k.includes(apiName.toLowerCase())) return v;
  }
  return undefined;
}

export function resolvePaymentApiName(apiName: string): string | undefined {
  return resolveFromMap(apiName, PAYMENT_API_NAME_MAP);
}

export function resolveNezoApiName(apiName: string): string | undefined {
  return resolveFromMap(apiName, NEZO_API_NAME_MAP);
}

/** @deprecated Use resolvePaymentApiName or resolveNezoApiName instead */
export function resolveApiName(apiName: string): string | undefined {
  return resolvePaymentApiName(apiName) ?? resolveNezoApiName(apiName);
}

export async function readDocument(path: string): Promise<string> {
  return readFile(join(MD_DIR, path), "utf-8");
}
