# 테스트 결과 — 2026-04-05

> 실행 시각: 17:22:41
> 전체 결과: **131 passed / 0 failed**
> 소요 시간: 1.10s

## 요약

| 테스트 파일 | 테스트 수 | 결과 | 소요시간 |
|------------|----------|------|---------|
| src/tool/get-payment-api-spec.test.ts | 7 | ✅ PASS | 263ms |
| src/tool/get-nezo-code-example.test.ts | 7 | ✅ PASS | 270ms |
| src/tool/get-docs.test.ts | 5 | ✅ PASS | 274ms |
| src/tool/document-by-id.test.ts | 5 | ✅ PASS | 279ms |
| src/tool/get-nezo-api-spec.test.ts | 8 | ✅ PASS | 280ms |
| src/scenarios/nezo-qa.test.ts | 17 | ✅ PASS | 282ms |
| src/scenarios/mobilpay-qa.test.ts | 15 | ✅ PASS | 313ms |
| src/scenarios/security-rules.test.ts | 12 | ✅ PASS | 326ms |
| src/tool/get-payment-code-example.test.ts | 9 | ✅ PASS | 328ms |
| src/search/bm25.test.ts | 7 | ✅ PASS | 3ms |
| src/indexer/doc-registry.test.ts | 18 | ✅ PASS | 4ms |
| src/utils/hmac.test.ts | 6 | ✅ PASS | 2ms |
| src/chunker/markdown-chunker.test.ts | 7 | ✅ PASS | 12ms |
| src/e2e/mcp-protocol.test.ts | 8 | ✅ PASS | 114ms |

## 계층별 집계

| 계층 | 파일 수 | 테스트 수 | 결과 |
|------|--------|----------|------|
| 유닛 테스트 (HMAC, BM25, Chunker) | 3 | 20 | ✅ |
| API 이름 해석 (doc-registry) | 1 | 18 | ✅ |
| 도구 핸들러 (6개 도구) | 6 | 41 | ✅ |
| E2E 프로토콜 | 1 | 8 | ✅ |
| MOBILPAY 시나리오 QA | 1 | 15 | ✅ |
| NEZO 시나리오 QA | 1 | 17 | ✅ |
| 보안 규칙 검증 | 1 | 12 | ✅ |

## 실패 항목

없음

## 보완 조치

해당 없음 (전체 통과)
