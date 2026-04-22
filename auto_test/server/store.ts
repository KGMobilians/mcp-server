import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { config } from "./config.js";

export interface TestResult {
  caseId: string;
  caseName: string;
  runId: string;
  timestamp: string;
  /* 거래등록 */
  registration: {
    tid?: string;
    tradeId: string;
    payUrl?: string;
    hmac?: string;
    timeStamp?: string;
    reqBody: Record<string, unknown>;
    resBody: Record<string, unknown>;
    success: boolean;
    error?: string;
  };
  /* ok_url 수신 */
  okUrl?: {
    receivedAt: string;
    params: Record<string, string>;
    code: string;
    hmacValid: boolean | null;
  };
  /* noti_url 수신 */
  notiUrl?: {
    receivedAt: string;
    params: Record<string, string>;
    code: string;
    hmacValid: boolean | null;
  };
  /* 하이브리드 승인 */
  approval?: {
    requestedAt: string;
    reqBody: Record<string, unknown>;
    resBody: Record<string, unknown>;
    success: boolean;
    error?: string;
  };
  /* 최종 판정 */
  verdict: "pending" | "success" | "fail";
  verdictReason: string;
}

const RESULTS_FILE = join(config.dataDir, "results.json");

function ensureDataDir(): void {
  if (!existsSync(config.dataDir)) {
    mkdirSync(config.dataDir, { recursive: true });
  }
}

export function loadResults(): TestResult[] {
  ensureDataDir();
  if (!existsSync(RESULTS_FILE)) return [];
  return JSON.parse(readFileSync(RESULTS_FILE, "utf-8"));
}

export function saveResults(results: TestResult[]): void {
  ensureDataDir();
  writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2), "utf-8");
}

export function addResult(result: TestResult): void {
  const results = loadResults();
  results.push(result);
  saveResults(results);
}

export function updateResult(
  runId: string,
  updater: (r: TestResult) => void,
): TestResult | undefined {
  const results = loadResults();
  const target = results.find((r) => r.runId === runId);
  if (target) {
    updater(target);
    saveResults(results);
  }
  return target;
}

export function getResultsByCase(caseId: string): TestResult[] {
  return loadResults().filter((r) => r.caseId === caseId);
}

export function getResultByRun(runId: string): TestResult | undefined {
  return loadResults().find((r) => r.runId === runId);
}
