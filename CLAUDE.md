# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP (Model Context Protocol) server for KG파이낸셜 payment services documentation search. It indexes 27 markdown documentation files across two services — MOBILPAY REST API (18 docs) and 내죠여왕 NEZO 알림톡 결제 (9 docs) — and exposes 6 MCP Tools.

Published as `@mobilpay/mcp-server` on NPM (v2.0.0).

## Commands

- **Build:** `npm run build` (runs `tsc`, outputs to `dist/`)
- **Dev:** `npm run dev` (runs `tsx src/index.ts` — uses stdio transport)
- **Test:** `npm run test` (runs `vitest run`, 20 tests across 3 suites)

## Architecture

6-tool MCP server using `@modelcontextprotocol/sdk` with stdio transport.

**Data pipeline at startup:**
1. `index.ts` → calls `buildIndex()` then registers 6 tools and connects transport
2. `indexer/doc-indexer.ts` → builds document registry from `md/llms.txt`, recursively reads all `.md` files under `md/payment/` and `md/nezo/`, chunks them, builds BM25 index
3. `indexer/doc-registry.ts` → parses `llms.txt` for document catalog, provides service-specific API name resolution (`resolvePaymentApiName`, `resolveNezoApiName`) and document lookup
4. `chunker/markdown-chunker.ts` → parses markdown with `remark-parse`, splits by headings, merges short chunks (< 30 words) into previous
5. `search/bm25.ts` → BM25 ranking (k1=1.2, b=0.75) with inverted index, same-source adjacent-window expansion, low-score filtering (30% threshold)

**MCP Tools:**

| Tool | Input | 용도 |
|------|-------|------|
| `get-docs` | `keywords: string[]` | 통합 BM25 키워드 검색 (결제연동 + 내죠여왕 27개 문서) |
| `document-by-id` | `id: number` | 문서 ID로 전체 내용 조회 (id=0: 목록) |
| `get-payment-api-spec` | `api_name: string` | MOBILPAY 결제연동 API 전체 명세 조회 |
| `get-payment-code-example` | `api_name: string, language?: string` | MOBILPAY 결제연동 언어별 코드 예제 |
| `get-nezo-api-spec` | `api_name: string` | 내죠여왕 API 전체 명세 조회 |
| `get-nezo-code-example` | `api_name: string, language?: string` | 내죠여왕 언어별 코드 예제 |

**Key types:** `Chunk` (chunker/types.ts), `ScoredChunk` (search/types.ts), `DocEntry` (indexer/doc-registry.ts)

## Documentation Structure (`md/`)

```
md/
├── llms.txt                        # 통합 문서 인덱스 (27개)
├── payment/                        # MOBILPAY REST API 결제연동 (18 files)
│   ├── llms.txt                    # 결제연동 문서 인덱스
│   ├── api/                        # API 레퍼런스 (11 files)
│   │   ├── registration.md         # 거래등록 API
│   │   ├── payment-window.md       # 결제창 호출
│   │   ├── auth-response.md        # 인증/승인 응답
│   │   ├── approval-tid.md         # 결제승인 (TID 방식)
│   │   ├── approval-mobilid.md     # 결제승인 (MOBILID 방식)
│   │   ├── cancel.md               # 결제취소
│   │   ├── refund.md               # 환불
│   │   ├── purchase.md             # 수동매입
│   │   ├── virtual-account.md      # 가상계좌
│   │   ├── cash-receipt.md         # 현금영수증
│   │   └── hmac.md                 # HMAC 무결성 검증
│   ├── guides/                     # 연동 가이드 (5 files)
│   │   ├── integration-guide.md
│   │   ├── flow-normal.md
│   │   ├── flow-hybrid.md
│   │   ├── noti-url.md
│   │   └── firewall.md
│   └── reference/                  # 코드표/에러코드 (2 files)
│       ├── payment-codes.md
│       └── error-codes.md
└── nezo/                           # 내죠여왕 알림톡 결제서비스 (9 files)
    ├── llms.txt                    # 내죠여왕 문서 인덱스
    ├── api/                        # API 레퍼런스 (5 files)
    │   ├── send.md                 # 결제 요청 (/send)
    │   ├── callback.md             # 콜백/리턴 URL
    │   ├── search.md               # 결제 조회 (/send/view)
    │   ├── cancel.md               # 결제 취소 (/cancel)
    │   └── resend.md               # 결제 재요청
    ├── guides/                     # 연동 가이드 (2 files)
    │   ├── start.md                # 시작하기
    │   └── firewall.md             # 방화벽 설정
    └── reference/                  # 레퍼런스 (2 files)
        ├── response-codes.md       # 공통 응답 코드
        └── mac-guide.md            # MAC 생성/검증 가이드
```

## Domain-Specific Rules (from tool descriptions)

### MOBILPAY REST API
1. `skey` (service key) must never appear in client-side code — load from env vars
2. HMAC verification must be server-side only
3. `noti_url` handler must include idempotency check using `tid`
4. Approval API (`/MUP/api/approval`) must be called from backend only
5. Test host: `test.mobilians.co.kr` / Production: `mup.mobilians.co.kr`

### 내죠여왕(NEZO) 알림톡 결제
1. `svc_id` and `MAC_KEY` must never appear in client-side code — load from env vars
2. HmacSHA256 MAC generation/verification must be server-side only
3. `callback_url` handler must include idempotency check using `trade_no`
4. All payment APIs must be called from backend only
5. Test host: `test.mpps.co.kr` / Production: `www.nezo.co.kr`
6. Request validity: 10 minutes

## Language

Documentation and tool descriptions are in Korean. The `md/` directory contains Korean payment API docs covering the full payment lifecycle for both MOBILPAY and NEZO services.
