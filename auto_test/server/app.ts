import express from "express";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { config, getBaseUrl, getCredentials } from "./config.js";
import { ALL_CASES, getCaseById, type TestCase, type AmountDetail } from "./test-cases.js";
import {
  addResult,
  updateResult,
  loadResults,
  getResultsByCase,
  getResultByRun,
  type TestResult,
} from "./store.js";
import { verifyHmac } from "./hmac.js";

const app = express();

/* ── 미들웨어 ── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/views", express.static(config.viewsDir));

/* ── 유틸 ── */
function now(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function generateTradeId(caseId: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  return `TEST_${caseId}_${ts}`;
}

/* ── 메인 대시보드 ── */
app.get("/", (_req, res) => {
  const html = readFileSync(join(config.viewsDir, "index.html"), "utf-8");
  res.type("html").send(html);
});

/* ── API: 테스트 케이스 목록 ── */
app.get("/api/cases", (_req, res) => {
  res.json(ALL_CASES);
});

/* ── API: 테스트 실행 (거래등록 → pay_url 반환) ── */
app.post("/api/test/start", async (req, res) => {
  const { caseId } = req.body;
  const tc = getCaseById(caseId);
  if (!tc) return res.status(400).json({ error: "케이스를 찾을 수 없습니다" });

  const runId = randomUUID().slice(0, 8);
  const tradeId = generateTradeId(tc.id);
  const baseUrl = getBaseUrl();
  const okUrl = `${baseUrl}/callback/ok/${runId}`;
  const notiUrl = tc.useNotiUrl ? `${baseUrl}/callback/noti/${runId}` : undefined;
  const closeUrl = (tc.callType === "S" || tc.callType === "I")
    ? `${baseUrl}/callback/close/${runId}`
    : undefined;

  // CN(신용카드)은 테스트서버 미지원 → 항상 운영서버 사용
  const apiHost = tc.cashCode === "CN" ? config.prodHost : config.apiHost;
  const cred = getCredentials(tc.cashCode);

  const amountObj = typeof tc.amount === "number"
    ? { total: tc.amount }
    : tc.amount;

  const regBody: Record<string, unknown> = {
    sid: cred.sid,
    cash_code: tc.cashCode,
    product_name: tc.productName,
    trade_id: tradeId,
    site_url: "test.mobilians.co.kr",
    ok_url: okUrl,
    amount: amountObj,
    call_type: tc.callType,
    hybrid_pay: tc.hybridPay,
  };
  if (notiUrl) regBody.noti_url = notiUrl;
  if (closeUrl) regBody.close_url = closeUrl;
  if (tc.payOptions) regBody.pay_options = tc.payOptions;

  try {
    const regRes = await fetch(`${apiHost}/MUP/api/registration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regBody),
    });
    const regData = await regRes.json() as Record<string, unknown>;

    const success = regData.code === "0000";
    const result: TestResult = {
      caseId: tc.id,
      caseName: tc.name,
      runId,
      timestamp: now(),
      registration: {
        tid: regData.tid as string | undefined,
        tradeId,
        payUrl: regData.pay_url as string | undefined,
        hmac: regData.hmac as string | undefined,
        timeStamp: regData.time_stamp as string | undefined,
        reqBody: regBody,
        resBody: regData,
        success,
        error: success ? undefined : `${regData.code}: ${regData.message}`,
      },
      verdict: success ? "pending" : "fail",
      verdictReason: success ? "거래등록 성공. 결제 진행 대기 중." : `거래등록 실패 — ${regData.code}: ${regData.message}`,
    };

    addResult(result);

    res.json({
      success,
      runId,
      tradeId,
      payUrl: regData.pay_url,
      tid: regData.tid,
      callType: tc.callType,
      error: result.registration.error,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const result: TestResult = {
      caseId: tc.id,
      caseName: tc.name,
      runId,
      timestamp: now(),
      registration: {
        tradeId,
        reqBody: regBody,
        resBody: {},
        success: false,
        error: `네트워크 오류: ${msg}`,
      },
      verdict: "fail",
      verdictReason: `거래등록 요청 실패 — ${msg}`,
    };
    addResult(result);
    res.status(500).json({ success: false, runId, error: msg });
  }
});

/* ── ok_url 콜백 수신 ── */
app.post("/callback/ok/:runId", (req, res) => {
  const { runId } = req.params;
  const params = req.body as Record<string, string>;

  console.log(`[ok_url] runId=${runId} code=${params.code} tid=${params.tid}`);

  const result = updateResult(runId, (r) => {
    const tc = getCaseById(r.caseId);
    const skey = tc ? getCredentials(tc.cashCode).skey : "";
    const hmacValid = params.hmac && r.registration.timeStamp && skey
      ? verifyHmac(
          skey,
          params.hmac,
          params.amount || "",
          r.registration.reqBody.ok_url as string || "",
          params.trade_id || r.registration.tradeId,
          r.registration.timeStamp,
        )
      : null;

    r.okUrl = {
      receivedAt: now(),
      params,
      code: params.code || "unknown",
      hmacValid,
    };

    if (params.code === "0000") {
      // 하이브리드는 아직 승인 필요
      if (tc?.hybridPay === "Y") {
        r.verdict = "pending";
        r.verdictReason = "인증 성공. 하이브리드 승인 API 호출 대기 중.";
        // 자동 승인 호출
        callApproval(r, params).catch(console.error);
      } else {
        r.verdict = "success";
        r.verdictReason = "결제 성공 (일반 플로우)";
      }
    } else {
      r.verdict = "fail";
      r.verdictReason = `ok_url 에러 — ${params.code}: ${params.message || ""}`;
    }
  });

  // MOBILPAY는 SUCCESS 또는 FAIL 텍스트만 기대
  res.type("text").send(result && params.code === "0000" ? "SUCCESS" : "FAIL");
});

/* ── noti_url 콜백 수신 ── */
app.post("/callback/noti/:runId", (req, res) => {
  const { runId } = req.params;
  const params = req.body as Record<string, string>;

  console.log(`[noti_url] runId=${runId} code=${params.code} tid=${params.tid}`);

  const result = updateResult(runId, (r) => {
    const tc = getCaseById(r.caseId);
    const skey = tc ? getCredentials(tc.cashCode).skey : "";
    const hmacValid = params.hmac && r.registration.timeStamp && skey
      ? verifyHmac(
          skey,
          params.hmac,
          params.amount || "",
          r.registration.reqBody.ok_url as string || "",
          params.trade_id || r.registration.tradeId,
          r.registration.timeStamp,
        )
      : null;

    r.notiUrl = {
      receivedAt: now(),
      params,
      code: params.code || "unknown",
      hmacValid,
    };
  });

  res.type("text").send(result ? "SUCCESS" : "FAIL");
});

/* ── close_url (사용자 취소) ── */
app.get("/callback/close/:runId", (req, res) => {
  const { runId } = req.params;
  updateResult(runId, (r) => {
    if (r.verdict === "pending") {
      r.verdict = "fail";
      r.verdictReason = "사용자가 결제를 취소했습니다.";
    }
  });
  res.type("html").send(`
    <html><body style="font-family:sans-serif;text-align:center;padding:40px">
      <h2>결제가 취소되었습니다</h2>
      <p>테스트 대시보드로 돌아가세요.</p>
      <script>if(window.opener){window.opener.postMessage({type:'payment_closed',runId:'${runId}'},'*');window.close()}</script>
    </body></html>
  `);
});

/* ── 하이브리드 승인 API 호출 ── */
async function callApproval(r: TestResult, okParams: Record<string, string>): Promise<void> {
  const tc = getCaseById(r.caseId);
  if (!tc) return;

  const totalAmount = typeof tc.amount === "number" ? tc.amount : tc.amount.total;
  const apiHost = tc.cashCode === "CN" ? config.prodHost : config.apiHost;
  const cred = getCredentials(tc.cashCode);

  const approvalBody: Record<string, unknown> = {
    sid: cred.sid,
    tid: r.registration.tid,
    cash_code: tc.cashCode,
    pay_token: okParams.pay_token,
    amount: String(totalAmount),
  };

  // MC는 mc_user_key 필요
  if (tc.cashCode === "MC" && okParams.mc_user_key) {
    approvalBody.mc_user_key = okParams.mc_user_key;
  }

  try {
    const res = await fetch(`${apiHost}/MUP/api/approval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(approvalBody),
    });
    const data = await res.json() as Record<string, unknown>;

    updateResult(r.runId, (r2) => {
      r2.approval = {
        requestedAt: now(),
        reqBody: approvalBody,
        resBody: data,
        success: data.code === "0000",
        error: data.code !== "0000" ? `${data.code}: ${data.message}` : undefined,
      };
      if (data.code === "0000") {
        r2.verdict = "success";
        r2.verdictReason = "결제 성공 (하이브리드 플로우 — 인증+승인 완료)";
      } else {
        r2.verdict = "fail";
        r2.verdictReason = `승인 실패 — ${data.code}: ${data.message}`;
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    updateResult(r.runId, (r2) => {
      r2.approval = {
        requestedAt: now(),
        reqBody: approvalBody,
        resBody: {},
        success: false,
        error: `승인 요청 오류: ${msg}`,
      };
      r2.verdict = "fail";
      r2.verdictReason = `승인 API 호출 실패 — ${msg}`;
    });
  }
}

/* ── API: 결과 조회 ── */
app.get("/api/results", (_req, res) => {
  res.json(loadResults().reverse());
});

app.get("/api/results/:caseId", (req, res) => {
  res.json(getResultsByCase(req.params.caseId).reverse());
});

app.get("/api/result/:runId", (req, res) => {
  const r = getResultByRun(req.params.runId);
  if (!r) return res.status(404).json({ error: "결과를 찾을 수 없습니다" });
  res.json(r);
});

/* ── 결과 분석 페이지 ── */
app.get("/results", (_req, res) => {
  const html = readFileSync(join(config.viewsDir, "results.html"), "utf-8");
  res.type("html").send(html);
});

/* ── 서버 시작 ── */
app.listen(config.port, () => {
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║  MOBILPAY 결제 테스트 도구               ║`);
  console.log(`╠══════════════════════════════════════════╣`);
  console.log(`║  로컬: http://localhost:${config.port}            ║`);
  if (config.ngrokUrl) {
    console.log(`║  ngrok: ${config.ngrokUrl.padEnd(31)}║`);
  }
  console.log(`║  API:  ${config.apiHost.padEnd(32)}║`);
  console.log(`╚══════════════════════════════════════════╝\n`);
  if (!config.ngrokUrl) {
    console.log("⚠ ngrok_url이 설정되지 않았습니다. ok_url/noti_url 콜백을 받으려면");
    console.log("  1. ngrok http 3100 실행");
    console.log("  2. config.json의 ngrok_url에 ngrok URL 입력");
    console.log("  3. 서버 재시작\n");
  }
  for (const [code, cred] of Object.entries(config.credentials)) {
    if (cred.sid.includes("_HERE")) {
      console.log(`⚠ config.json에 ${code} 인증정보(sid/skey)를 설정해주세요.`);
    }
  }
  console.log("");
});
