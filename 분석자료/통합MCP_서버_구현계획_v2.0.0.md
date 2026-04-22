# MOBILPAY + 내죠여왕 통합 MCP 서버 v2.0.0 구현 계획

## Context

기존 `@mobilpay/mcp-server` v1.1.0은 MOBILPAY REST API 결제연동 문서(18개)만 제공하는 4-Tool MCP 서버입니다. 내죠여왕(NEZO) 알림톡 결제서비스 문서(9개)를 **동일 MCP 서버에 통합**하여, 가맹점 개발자가 MCP 설정 1개만으로 모빌리언스의 모든 결제 서비스 문서를 검색/조회할 수 있게 합니다.

**통합 결정 이유**: 개발자 경험(DX) — 설정 1개, AI가 서비스 간 cross-검색 가능, 문서 규모 27개로 BM25 성능 문제 없음.

---

## 변경 요약

| 항목 | Before (v1.1.0) | After (v2.0.0) |
|------|-----------------|----------------|
| 서비스 | 결제연동만 | 결제연동 + 내죠여왕 |
| 문서 수 | 18개 | 27개 (18 + 9) |
| MCP Tools | 4개 | 6개 (2공통 + 2결제 + 2내죠) |
| Skills | 1개 (mobilpay-integration) | 2개 (+nezo-integration) |
| 서버 이름 | "mobilpay" | "mobilians" |
| NPM 버전 | 1.1.0 | 2.0.0 |

---

## Step 1: md/ 디렉토리 재구조화

기존 문서를 `md/payment/` 하위로 이동하고, 내죠여왕 문서를 `md/nezo/`에 추가합니다.

```
md/
├── payment/                    # 기존 결제연동 문서 (18개, 기존 md/ 내용 이동)
│   ├── llms.txt               # 결제연동 문서 인덱스
│   ├── api/                   # 11 API 레퍼런스
│   ├── guides/                # 5 연동 가이드
│   └── reference/             # 2 코드표/에러코드
├── nezo/                      # 내죠여왕 문서 (9개, 신규 작성)
│   ├── llms.txt               # 내죠여왕 문서 인덱스
│   ├── api/                   # 5 API 레퍼런스
│   │   ├── send.md            # 결제 요청 (/send)
│   │   ├── callback.md        # 콜백/리턴 URL
│   │   ├── search.md          # 결제 조회 (/send/view)
│   │   ├── cancel.md          # 결제 취소 (/cancel)
│   │   └── resend.md          # 결제 재요청
│   ├── guides/                # 2 연동 가이드
│   │   ├── start.md           # 시작하기 (개요, 접속정보, MAC)
│   │   └── firewall.md        # 방화벽 설정
│   └── reference/             # 2 레퍼런스
│       ├── response-codes.md  # 공통 응답 코드
│       └── mac-guide.md       # MAC 생성/검증 가이드
└── llms.txt                   # 통합 문서 인덱스 (양쪽 서비스 모두 포함)
```

### 작업 상세
- 기존 `md/api/`, `md/guides/`, `md/reference/`, `md/llms.txt` → `md/payment/` 하위로 이동
- `md/nezo/` 디렉토리 생성 및 9개 마크다운 문서 작성 (개발자사이트 기반)
- `md/llms.txt` (루트) 신규 생성 — 통합 인덱스 (payment 18개 + nezo 9개 = 27개)

---

## Step 2: doc-registry.ts 수정

### 변경 사항
1. `MD_DIR` 경로는 그대로 (`md/` 루트)
2. `buildRegistry()`: 루트 `md/llms.txt`를 파싱 (경로가 `payment/api/registration.md`, `nezo/api/send.md` 형태)
3. `API_NAME_MAP` 확장: 내죠여왕 API 별칭 추가
4. `resolveApiName()` → 서비스별 버전 2개로 분리: `resolvePaymentApiName()`, `resolveNezoApiName()`

### API_NAME_MAP 추가 (내죠여왕)
```typescript
// 내죠여왕 전용
const NEZO_API_NAME_MAP: Record<string, string> = {
  "send": "nezo/api/send.md",
  "결제요청": "nezo/api/send.md",
  "알림톡결제": "nezo/api/send.md",
  "callback": "nezo/api/callback.md",
  "콜백": "nezo/api/callback.md",
  "search": "nezo/api/search.md",
  "결제조회": "nezo/api/search.md",
  "cancel": "nezo/api/cancel.md",
  "결제취소": "nezo/api/cancel.md",   // 내죠여왕용
  "resend": "nezo/api/resend.md",
  "재요청": "nezo/api/resend.md",
  "start": "nezo/guides/start.md",
  "시작하기": "nezo/guides/start.md",
  "mac": "nezo/reference/mac-guide.md",
  "mac검증": "nezo/reference/mac-guide.md",
  "응답코드": "nezo/reference/response-codes.md",
  "방화벽": "nezo/guides/firewall.md",   // 내죠여왕용
};
```

기존 `API_NAME_MAP`은 `PAYMENT_API_NAME_MAP`으로 rename하고 경로를 `payment/` prefix 추가.

**파일**: `src/indexer/doc-registry.ts`

---

## Step 3: doc-indexer.ts 수정

### 변경 사항
- `MD_DIR`은 그대로 `md/` 루트를 가리킴
- `buildIndex()`는 `md/` 하위 전체를 recursive 스캔하므로 변경 불필요
- `buildRegistry()`는 루트 `md/llms.txt`를 읽도록 변경 (doc-registry에서)
- chunk의 `source` 필드가 `payment/api/registration.md`, `nezo/api/send.md` 형태로 자동 생성됨

**파일**: `src/indexer/doc-indexer.ts` (최소 변경)

---

## Step 4: MCP Tools 재구성 (4개 → 6개)

### 공통 Tools (2개, 기존 수정)

#### `get-docs` (기존 `get-mobilpay-docs` rename)
- 통합 BM25 검색 — 결제연동 + 내죠여왕 27개 문서 전체 대상
- Tool description에 양쪽 서비스 보안 규칙 모두 포함
- **파일**: `src/tool/get-docs.ts` (기존 파일 rename + 수정)

#### `document-by-id` (기존 유지, 설명만 수정)
- 통합 문서 목록 (27개) 대상
- description에 "MOBILPAY 결제연동 및 내죠여왕" 명시
- **파일**: `src/tool/document-by-id.ts` (설명 수정)

### 결제연동 전용 Tools (2개, 기존 수정)

#### `get-payment-api-spec` (기존 `get-api-spec` rename)
- `PAYMENT_API_NAME_MAP`으로 resolve
- description에 결제연동 API만 나열
- **파일**: `src/tool/get-payment-api-spec.ts`

#### `get-payment-code-example` (기존 `get-code-example` rename)
- `PAYMENT_API_NAME_MAP`으로 resolve
- **파일**: `src/tool/get-payment-code-example.ts`

### 내죠여왕 전용 Tools (2개, 신규)

#### `get-nezo-api-spec` (신규)
- `NEZO_API_NAME_MAP`으로 resolve
- description에 내죠여왕 보안 규칙 포함 (svc_id, MAC_KEY, HmacSHA256)
- **파일**: `src/tool/get-nezo-api-spec.ts`

#### `get-nezo-code-example` (신규)
- `NEZO_API_NAME_MAP`으로 resolve
- **파일**: `src/tool/get-nezo-code-example.ts`

---

## Step 5: index.ts 수정

```typescript
const server = new McpServer({
  name: "mobilians",   // "mobilpay" → "mobilians" (통합 브랜딩)
  version: "2.0.0",
});

await buildIndex();

// 공통 Tools
registerGetDocsTool(server);
registerDocumentByIdTool(server);
// 결제연동 Tools
registerGetPaymentApiSpecTool(server);
registerGetPaymentCodeExampleTool(server);
// 내죠여왕 Tools
registerGetNezoApiSpecTool(server);
registerGetNezoCodeExampleTool(server);
```

**파일**: `src/index.ts`

---

## Step 6: 내죠여왕 마크다운 문서 작성 (9개)

개발자사이트(testtauth.mobilians.co.kr/nezo_guide/)에서 수집한 정보 기반으로 작성.

| 파일 | 주요 내용 |
|------|----------|
| `nezo/api/send.md` | `/send` 엔드포인트, 15개 요청 파라미터, 7개 응답 파라미터, 예시 |
| `nezo/api/callback.md` | callback_url/return_url 처리, 14개 콜백 파라미터 |
| `nezo/api/search.md` | `/send/view` 엔드포인트, 요청/응답 파라미터, cancel_yn/link_url |
| `nezo/api/cancel.md` | `/cancel` 엔드포인트, 5개 요청/6개 응답 파라미터 |
| `nezo/api/resend.md` | 재요청 엔드포인트, 4개 요청/6개 응답 파라미터 |
| `nezo/guides/start.md` | 서비스 개요, 접속정보, API목록, MAC 설명, 유효시간 |
| `nezo/guides/firewall.md` | 방화벽 IP/PORT 설정 |
| `nezo/reference/response-codes.md` | result_cd 전체 목록 |
| `nezo/reference/mac-guide.md` | HmacSHA256 MAC 생성/검증 방법, KEY 구성 |

**참고**: 공통 응답 코드, MAC 검증 도우미, 방화벽 설정은 SPA 동적 로딩으로 웹에서 직접 수집 불가. 사용자에게 수동 보완 요청 필요.

---

## Step 7: 내죠여왕 Skill 추가

기존 `skills/mobilpay-integration/` 구조를 참고하여 `skills/nezo-integration/` 생성.

```
skills/
├── mobilpay-integration/        # 기존 (변경 없음)
├── mobilpay-integration.skill   # 기존 (변경 없음)
├── nezo-integration/            # 신규
│   ├── SKILL.md                 # 내죠여왕 연동 전문가 스킬
│   ├── evals/evals.json         # 평가 테스트 케이스
│   └── references/              # 내죠여왕 md 문서 복사
│       ├── api/
│       ├── guides/
│       └── reference/
└── nezo-integration.skill       # 신규 스킬 정의
```

**SKILL.md 주요 내용**:
- 내죠여왕 서비스 개요 (카카오 알림톡 결제)
- API 엔드포인트 3개 (/send, /send/view, /cancel)
- 보안 규칙 7개 (svc_id, MAC_KEY, HmacSHA256, 콜백 멱등성 등)
- 결제수단 (MC: 휴대폰, CN: 신용카드)
- 코드 생성 체크리스트

---

## Step 8: package.json, CLAUDE.md, README.md 업데이트

### package.json
- `version`: "1.1.0" → "2.0.0"
- `description`: "KG모빌리언스 결제서비스(MOBILPAY + 내죠여왕) 연동을 위한 MCP 서버"

### CLAUDE.md
- 6-Tool 구조 설명 추가
- 내죠여왕 문서 구조 추가
- 내죠여왕 보안 규칙 추가

### README.md
- 통합 서비스 소개
- 6개 Tool 설명
- 2개 Skills 소개

---

## Step 9: 테스트 업데이트

- 기존 테스트는 chunk source 경로가 `api/registration.md` → `payment/api/registration.md`로 변경되므로 수정 필요
- 내죠여왕 문서 검색 테스트 추가 (예: `["알림톡", "결제요청"]` → nezo/api/send.md 반환)

---

## 수정/생성 파일 목록

| 파일 | 작업 | 설명 |
|------|------|------|
| `md/payment/` | 이동 | 기존 md/ 하위 파일을 payment/로 이동 |
| `md/nezo/**/*.md` (9개) | 생성 | 내죠여왕 마크다운 문서 |
| `md/llms.txt` | 생성 | 통합 문서 인덱스 (27개) |
| `md/payment/llms.txt` | 이동 | 기존 llms.txt |
| `src/index.ts` | 수정 | 서버명, 버전, 6개 Tool 등록 |
| `src/indexer/doc-registry.ts` | 수정 | NEZO_API_NAME_MAP 추가, resolve 함수 분리 |
| `src/indexer/doc-indexer.ts` | 수정 | 루트 llms.txt 경로 변경 |
| `src/tool/get-docs.ts` | 수정(rename) | 통합 BM25 검색 |
| `src/tool/document-by-id.ts` | 수정 | description 업데이트 |
| `src/tool/get-payment-api-spec.ts` | 수정(rename) | 결제연동 API 명세 |
| `src/tool/get-payment-code-example.ts` | 수정(rename) | 결제연동 코드 예제 |
| `src/tool/get-nezo-api-spec.ts` | 생성 | 내죠여왕 API 명세 |
| `src/tool/get-nezo-code-example.ts` | 생성 | 내죠여왕 코드 예제 |
| `src/tool/get-mobilpay-docs.ts` | 삭제 | get-docs.ts로 대체 |
| `src/tool/get-api-spec.ts` | 삭제 | get-payment-api-spec.ts로 대체 |
| `src/tool/get-code-example.ts` | 삭제 | get-payment-code-example.ts로 대체 |
| `skills/nezo-integration.skill` | 생성 | 내죠여왕 스킬 정의 |
| `skills/nezo-integration/SKILL.md` | 생성 | 내죠여왕 스킬 문서 |
| `skills/nezo-integration/references/` | 생성 | 내죠여왕 참조 문서 |
| `package.json` | 수정 | version 2.0.0, description |
| `CLAUDE.md` | 수정 | 통합 구조 반영 |
| `README.md` | 수정 | 통합 서비스 안내 |
| 테스트 파일들 | 수정 | source 경로 변경 반영 |

---

## 검증

1. `npm run build` — TypeScript 컴파일 성공
2. `npm run test` — 기존 + 신규 테스트 전부 통과
3. `npx tsx src/index.ts` — MCP Inspector로 6개 Tool 동작 확인
4. `npm pack` — dist/ + md/ (payment/ + nezo/) 포함 확인

---

## 작업 순서

1. md/ 디렉토리 재구조화 (기존 문서 이동)
2. 내죠여왕 마크다운 문서 9개 작성
3. 통합 llms.txt 작성
4. doc-registry.ts 수정 (NEZO_API_NAME_MAP, resolve 분리)
5. doc-indexer.ts 수정 (llms.txt 경로)
6. MCP Tools 재구성 (rename + 신규 2개)
7. index.ts 수정 (6개 Tool 등록)
8. 테스트 수정 및 추가
9. Skills 추가 (nezo-integration)
10. package.json, CLAUDE.md, README.md 업데이트
11. 빌드 & 테스트 검증
