# 내죠여왕(NEZO) 알림톡 결제서비스 - MCP & Skills 개발 계획

## 1. 서비스 개요

### 내죠여왕이란?
- **서비스명**: 내죠여왕 (NEZO Queen)
- **설명**: 카카오 알림톡을 이용한 결제 요청 서비스
- **운영사**: (주)KG 모빌리언스
- **테스트 서버**: `https://test.mpps.co.kr/buy4me`
- **운영 서버**: `https://www.nezo.co.kr`
- **개발자 가이드**: `https://testtauth.mobilians.co.kr/nezo_guide/`

### API 기술 사양
- **프로토콜**: HTTPS
- **HTTP 메서드**: POST
- **인코딩**: UTF-8
- **응답 형식**: JSON
- **보안**: HmacSHA256 기반 MAC(메시지 인증 코드)
- **유효 시간**: 전문 유효 시간 10분

### API 전문 목록
| API | 엔드포인트 | 설명 |
|-----|-----------|------|
| 결제 요청 | `/send` | 고객에게 알림톡 결제 요청 발송 |
| 결제 조회 | `/send/view` | 결제 상태 조회 |
| 결제 취소 | `/cancel` | 결제 취소 처리 |
| 결제 재요청 | (재전송) | 알림톡 결제 재요청 |

### 결제 수단
- **MC**: 휴대폰 결제
- **CN**: 신용카드 결제

---

## 2. MCP 서버 개발 계획

### 2.1 프로젝트 구조

```
nezo_mcp/
├── md/                              # 마크다운 문서 (NPM 패키지에 번들)
│   ├── llms.txt                     # 문서 인덱스
│   ├── api/                         # API 레퍼런스
│   │   ├── send.md                  # 결제 요청 API
│   │   ├── search.md                # 결제 조회 API
│   │   ├── cancel.md                # 결제 취소 API
│   │   ├── resend.md                # 결제 재요청 API
│   │   └── callback.md              # 콜백/리턴 URL
│   ├── guides/                      # 연동 가이드
│   │   ├── start.md                 # 시작하기 (개요, 접속정보)
│   │   ├── mac-guide.md             # MAC 생성/검증 가이드
│   │   └── firewall.md              # 방화벽 설정 가이드
│   └── reference/                   # 레퍼런스
│       └── response-codes.md        # 공통 응답 코드
├── src/
│   ├── index.ts                     # 진입점: McpServer + STDIO 연결
│   ├── chunker/
│   │   ├── types.ts                 # Chunk 인터페이스
│   │   └── markdown-chunker.ts      # 마크다운 헤더 기준 청크 분할
│   ├── search/
│   │   ├── types.ts                 # ScoredChunk 인터페이스
│   │   └── bm25.ts                  # BM25 검색 엔진
│   ├── indexer/
│   │   ├── doc-indexer.ts           # md 로드 → 청킹 → 인덱스 빌드
│   │   └── doc-registry.ts          # llms.txt 파싱, 문서 카탈로그
│   └── tool/
│       ├── get-nezo-docs.ts         # BM25 키워드 검색
│       ├── get-api-spec.ts          # API 전체 명세 조회
│       ├── document-by-id.ts        # 문서 ID 조회
│       └── get-code-example.ts      # 언어별 코드 예제 추출
├── package.json
├── tsconfig.json
└── .npmignore
```

### 2.2 MCP Tools 설계

#### Tool 1: `get-nezo-docs` (BM25 키워드 검색)
```
이름: get-nezo-docs
설명: 내죠여왕 알림톡 결제 연동 문서를 검색합니다.

보안 규칙 (생성 코드에 반드시 준수):
1. svc_id(서비스ID)와 MAC KEY는 절대 클라이언트 코드에 포함 금지. 환경변수에서 로드.
2. MAC(HmacSHA256) 생성/검증은 반드시 서버 사이드에서 처리.
3. callback_url 처리 시 중복 거래 방어 로직(trade_no 기반 멱등성) 필수.
4. 결제 요청/취소/조회 API는 반드시 백엔드에서 호출.
5. 테스트: test.mpps.co.kr / 운영: www.nezo.co.kr

Input: { keywords: string[] }
Output: 관련도 상위 10개 청크 + 인접 청크 (텍스트)
```

#### Tool 2: `get-api-spec` (API 전체 명세)
```
이름: get-api-spec
설명: 내죠여왕 특정 API의 전체 명세(엔드포인트, 파라미터, 응답, 예제)를 조회합니다.

Input: { api_name: string }
  - 지원값: "결제요청", "send", "결제조회", "search", "결제취소", "cancel", "결제재요청", "resend", "콜백", "callback"
Output: 해당 API의 전체 마크다운 문서
```

#### Tool 3: `document-by-id` (문서 ID 조회)
```
이름: document-by-id
설명: 내죠여왕 문서를 ID로 조회합니다. id=0이면 전체 문서 목록을 반환합니다.

Input: { id: number }
Output: 해당 문서의 전체 내용 또는 문서 목록
```

#### Tool 4: `get-code-example` (코드 예제 추출)
```
이름: get-code-example
설명: 내죠여왕 API의 언어별 코드 예제를 추출합니다.

Input: { api_name: string, language?: string }
Output: 해당 API의 코드 블록 (언어 필터링 가능)
```

### 2.3 핵심 기술 결정

| 항목 | 선택 | 이유 |
|------|------|------|
| Transport | STDIO | MOBILPAY MCP와 동일 — IDE가 프로세스 직접 관리 |
| 검색 | BM25 (k1=1.2, b=0.75) | 외부 의존성 없이 경량 키워드 검색 |
| 문서 파싱 | remark-parse (AST) | heading 기반 정확한 청크 분리 |
| 배포 | NPM scoped package | `npx -y @nezo/mcp-server@latest`로 즉시 실행 |
| 보안 | HmacSHA256 MAC | 내죠여왕 API 무결성 검증 표준 |
| 문서 카탈로그 | llms.txt | LLM 친화적 표준 문서 인덱스 |

### 2.4 코드 재사용 전략 (MOBILPAY MCP 기반)

기존 `@mobilpay/mcp-server`에서 **핵심 엔진을 그대로 재사용**하고, 도메인(문서, Tool 설명)만 교체합니다.

| 모듈 | 재사용 | 변경 필요 |
|------|--------|----------|
| `chunker/markdown-chunker.ts` | ✅ 그대로 | - |
| `chunker/types.ts` | ✅ 그대로 | - |
| `search/bm25.ts` | ✅ 그대로 | - |
| `search/types.ts` | ✅ 그대로 | - |
| `indexer/doc-indexer.ts` | ✅ 거의 동일 | md 경로만 변경 |
| `indexer/doc-registry.ts` | ⚠️ 수정 필요 | API_NAME_MAP을 내죠여왕용으로 교체 |
| `tool/*.ts` | ⚠️ 수정 필요 | Tool 이름/설명을 내죠여왕용으로 교체 |
| `index.ts` | ⚠️ 수정 필요 | 서버명, 버전, Tool 등록 변경 |
| `md/` 문서 전체 | ❌ 새로 작성 | 내죠여왕 개발자사이트 기반 |

### 2.5 마크다운 문서 작성 계획

개발자사이트(https://testtauth.mobilians.co.kr/nezo_guide/)의 9개 섹션을 마크다운으로 변환:

| 문서 | 파일명 | 원본 페이지 | 주요 내용 |
|------|--------|------------|----------|
| 시작하기 | `guides/start.md` | start.html | 서비스 개요, 접속정보, API목록, MAC 설명, 제약사항 |
| 결제 요청 | `api/send.md` | request.html | `/send` 엔드포인트, 15개 요청 파라미터, 7개 응답 파라미터, 예시 |
| 콜백/리턴 URL | `api/callback.md` | callback.html | callback_url/return_url 처리, 14개 콜백 파라미터 |
| 결제 조회 | `api/search.md` | search.html | `/send/view` 엔드포인트, 요청/응답 파라미터, cancel_yn/link_url |
| 결제 취소 | `api/cancel.md` | cancel.html | `/cancel` 엔드포인트, 5개 요청/6개 응답 파라미터 |
| 결제 재요청 | `api/resend.md` | resend.html | 재요청 엔드포인트, 4개 요청/6개 응답 파라미터 |
| 공통 응답 코드 | `reference/response-codes.md` | (SPA 동적) | 결과코드(result_cd) 전체 목록 |
| MAC 검증 가이드 | `guides/mac-guide.md` | (SPA 동적) | HmacSHA256 생성 방법, KEY 구성, 검증 로직 |
| 방화벽 설정 | `guides/firewall.md` | (SPA 동적) | 허용 IP, 포트 설정 |

### 2.6 NPM 패키지 정보

```json
{
  "name": "@nezo/mcp-server",
  "version": "1.0.0",
  "description": "내죠여왕 알림톡 결제서비스 연동을 위한 MCP 서버",
  "bin": { "nezo-mcp-server": "dist/index.js" }
}
```

### 2.7 IDE 연동 설정

```json
{
  "mcpServers": {
    "nezo": {
      "command": "npx",
      "args": ["-y", "@nezo/mcp-server@latest"]
    }
  }
}
```

---

## 3. Skills 개발 계획

### 3.1 Skills란?

Skills는 Kiro IDE에서 사용되는 **프롬프트 기반 자동화 워크플로우**입니다. `.kiro/skills/` 디렉토리에 마크다운 파일로 정의하며, 개발자가 `/skill-name` 명령으로 호출하면 사전 정의된 프롬프트가 실행됩니다.

### 3.2 내죠여왕 Skills 목록

#### Skill 1: `/nezo-send` (결제 요청 코드 생성)
```markdown
# nezo-send

## Description
내죠여왕 알림톡 결제 요청 API 연동 코드를 생성합니다.

## Prompt
내죠여왕 결제 요청 API(/send)를 호출하는 코드를 작성해주세요.

요구사항:
1. svc_id와 MAC KEY는 환경변수(NEZO_SVC_ID, NEZO_MAC_KEY)에서 로드
2. HmacSHA256으로 MAC 값 생성 (KEY = svc_id + send_dttm + MAC_KEY)
3. trade_no는 유니크한 값으로 자동 생성
4. callback_url은 파라미터로 받기
5. 에러 처리 포함
6. 테스트/운영 서버 분기 처리 (환경변수)

필수 파라미터: recv_hp, item_price, item_nm
선택 파라미터: return_url, send_msg_yn, valid_en_dt, taxat_amt
```

#### Skill 2: `/nezo-search` (결제 조회 코드 생성)
```markdown
# nezo-search

## Description
내죠여왕 결제 조회 API 연동 코드를 생성합니다.

## Prompt
내죠여왕 결제 조회 API(/send/view)를 호출하는 코드를 작성해주세요.

요구사항:
1. 환경변수에서 인증 정보 로드
2. MAC 생성 및 응답 MAC 검증
3. trade_no 또는 pay_no로 조회
4. cancel_yn 상태 확인 로직 포함
5. link_url 존재 시 미결제 상태 처리
```

#### Skill 3: `/nezo-cancel` (결제 취소 코드 생성)
```markdown
# nezo-cancel

## Description
내죠여왕 결제 취소 API 연동 코드를 생성합니다.

## Prompt
내죠여왕 결제 취소 API(/cancel)를 호출하는 코드를 작성해주세요.

요구사항:
1. 환경변수에서 인증 정보 로드
2. trade_no, pay_no 필수 파라미터 검증
3. MAC 생성 (KEY = svc_id + send_dttm + MAC_KEY)
4. 응답 MAC 검증
5. 취소 결과 확인 및 에러 처리
```

#### Skill 4: `/nezo-callback` (콜백 핸들러 코드 생성)
```markdown
# nezo-callback

## Description
내죠여왕 결제 완료 콜백(callback_url) 수신 핸들러를 생성합니다.

## Prompt
내죠여왕 결제 완료 콜백을 처리하는 서버 핸들러를 작성해주세요.

요구사항:
1. POST로 수신되는 콜백 파라미터 파싱
2. MAC 검증 (응답 MAC = svc_id + sys_dttm + MAC_KEY)
3. trade_no 기반 중복 처리 방어 (멱등성)
4. result_cd 확인하여 성공/실패 분기 처리
5. pay_method에 따른 결제수단 구분 (MC: 휴대폰, CN: 신용카드)
6. auto_bill_key 존재 시 자동결제 등록 처리
7. HTTP 200 응답 반환 (실패 시 모빌리언스가 재시도)
```

#### Skill 5: `/nezo-mac` (MAC 생성/검증 유틸리티)
```markdown
# nezo-mac

## Description
내죠여왕 MAC(HmacSHA256) 생성 및 검증 유틸리티 코드를 생성합니다.

## Prompt
내죠여왕 API에서 사용하는 MAC 생성/검증 유틸리티를 작성해주세요.

요구사항:
1. HmacSHA256 알고리즘 사용
2. 요청 MAC: KEY = svc_id + send_dttm + MAC_KEY
3. 응답 MAC: KEY = svc_id + sys_dttm + MAC_KEY
4. 결과는 64자리 16진수 문자열
5. 생성 함수와 검증 함수 분리
6. MAC_KEY는 환경변수에서 로드
```

#### Skill 6: `/nezo-fullstack` (전체 연동 스캐폴딩)
```markdown
# nezo-fullstack

## Description
내죠여왕 전체 결제 연동 코드를 한 번에 생성합니다 (결제요청 → 콜백수신 → 조회 → 취소).

## Prompt
내죠여왕 알림톡 결제서비스의 전체 연동 코드를 생성해주세요.

포함 기능:
1. MAC 유틸리티 (생성/검증)
2. 결제 요청 (/send) — 알림톡 발송
3. 콜백 핸들러 (callback_url) — 결제 완료 수신
4. 결제 조회 (/send/view) — 상태 확인
5. 결제 취소 (/cancel) — 거래 취소
6. 결제 재요청 (resend) — 알림톡 재발송
7. 환경 설정 (.env 템플릿)

보안 규칙:
- svc_id, MAC_KEY는 환경변수
- 모든 API 호출은 서버사이드
- 콜백 핸들러에 멱등성 구현
- 테스트/운영 서버 분기
```

### 3.3 Skills 파일 구조

```
.kiro/skills/
├── nezo-send.md           # 결제 요청 코드 생성
├── nezo-search.md         # 결제 조회 코드 생성
├── nezo-cancel.md         # 결제 취소 코드 생성
├── nezo-callback.md       # 콜백 핸들러 생성
├── nezo-mac.md            # MAC 유틸리티 생성
└── nezo-fullstack.md      # 전체 연동 스캐폴딩
```

---

## 4. 개발 로드맵

### Phase 1: 문서 준비 (Day 1)
| 단계 | 작업 | 산출물 |
|------|------|--------|
| 1-1 | 개발자사이트 9개 섹션 → 마크다운 변환 | `md/` 디렉토리 (9개 파일) |
| 1-2 | llms.txt 문서 인덱스 작성 | `md/llms.txt` |
| 1-3 | 공통 응답 코드, MAC 가이드, 방화벽 정보 수동 보완 | 완전한 문서 세트 |

### Phase 2: MCP 서버 구축 (Day 1)
| 단계 | 작업 | 산출물 |
|------|------|--------|
| 2-1 | MOBILPAY MCP에서 공통 모듈 복사 (chunker, search, indexer) | 기반 코드 |
| 2-2 | doc-registry의 API_NAME_MAP 내죠여왕용으로 교체 | 문서 레지스트리 |
| 2-3 | 4개 Tool 구현 (Tool 이름/설명 내죠여왕 맞춤) | MCP Tools |
| 2-4 | 단위/통합 테스트 작성 | vitest 테스트 |
| 2-5 | 빌드 및 동작 검증 | `@nezo/mcp-server` 빌드 |

### Phase 3: NPM 배포 (Day 1-2)
| 단계 | 작업 | 산출물 |
|------|------|--------|
| 3-1 | NPM @nezo 조직 생성 | NPM org |
| 3-2 | `npm publish --access public` | v1.0.0 배포 |
| 3-3 | `npx -y @nezo/mcp-server@latest` 동작 확인 | 배포 검증 |

### Phase 4: Skills 개발 (Day 2)
| 단계 | 작업 | 산출물 |
|------|------|--------|
| 4-1 | `.kiro/skills/` 디렉토리 생성 | Skills 디렉토리 |
| 4-2 | 6개 Skill 파일 작성 | `.kiro/skills/*.md` |
| 4-3 | Kiro IDE에서 각 Skill 동작 검증 | 검증 완료 |

### Phase 5: IDE 연동 및 문서화 (Day 2)
| 단계 | 작업 | 산출물 |
|------|------|--------|
| 5-1 | Cursor / Kiro / VS Code MCP 설정 파일 생성 | IDE 설정 |
| 5-2 | README.md 작성 | 사용 가이드 |
| 5-3 | CLAUDE.md 작성 | AI 코딩 도구용 지침 |

---

## 5. 예상 소요 시간

MOBILPAY MCP의 핵심 엔진(BM25, Chunker, Indexer)을 **그대로 재사용**하므로 개발 속도가 크게 단축됩니다.

| Phase | 예상 시간 | 비고 |
|-------|----------|------|
| Phase 1: 문서 준비 | ~2시간 | 개발자사이트 → 마크다운 변환 |
| Phase 2: MCP 서버 | ~1시간 | 핵심 엔진 재사용, 도메인만 교체 |
| Phase 3: NPM 배포 | ~30분 | MOBILPAY 배포 경험 활용 |
| Phase 4: Skills | ~1시간 | 6개 Skill 파일 작성 |
| Phase 5: IDE 연동 | ~30분 | 설정 파일 + 문서화 |
| **합계** | **~5시간** | |

---

## 6. 내죠여왕 vs MOBILPAY 비교

| 항목 | MOBILPAY REST API | 내죠여왕 (NEZO) |
|------|-------------------|----------------|
| 서비스 유형 | 범용 결제 연동 | 카카오 알림톡 결제 |
| API 수 | 11+ (거래등록, 승인, 취소 등) | 4 (요청, 조회, 취소, 재요청) |
| 문서 수 | 18개 | 9개 |
| 보안 | HMAC (skey 기반) | HmacSHA256 MAC (MAC_KEY 기반) |
| 인증키 | skey (서비스키) | svc_id + MAC_KEY |
| 테스트 서버 | test.mobilians.co.kr | test.mpps.co.kr |
| 운영 서버 | mup.mobilians.co.kr | www.nezo.co.kr |
| NPM 패키지 | @mobilpay/mcp-server | @nezo/mcp-server |
| MCP Tools | 4개 | 4개 |
| Skills | 미개발 | 6개 (신규) |

---

## 7. 보안 규칙 (도메인 특화)

내죠여왕 연동 코드 생성 시 반드시 준수해야 할 보안 규칙:

1. **svc_id & MAC_KEY 보호**: 절대 클라이언트(프론트엔드) 코드에 포함 금지. 환경변수(`NEZO_SVC_ID`, `NEZO_MAC_KEY`)에서 로드
2. **MAC 서버사이드**: HmacSHA256 MAC 생성/검증은 반드시 서버에서 처리
3. **콜백 멱등성**: `callback_url` 핸들러에서 `trade_no` 기반 중복 처리 방어 필수
4. **API 백엔드 호출**: 결제요청/조회/취소 API는 반드시 백엔드에서 호출
5. **서버 분기**: 테스트(`test.mpps.co.kr`) / 운영(`www.nezo.co.kr`) 환경 분리
6. **유효시간 준수**: 전문 유효 시간 10분 초과 시 오류 — 타임스탬프 적절히 관리
7. **callback_url 형식**: 완전한 URL 형식 필요 (예: `https://xxx.xxxx.com/pay/callback.do`)
