# AI 연동 가이드

## MCP + Skills로 결제 연동하기

MOBILPAY는 AI 코딩 도구에서 결제 연동을 빠르고 정확하게 수행할 수 있도록 **MCP 서버**와 **Agent Skill** 두 가지를 제공합니다. MOBILPAY REST API 결제연동과 내죠여왕(NEZO) 알림톡 결제서비스를 모두 지원합니다.

---

### MCP와 Skills 한눈에 보기

| 구분 | MCP Server | Agent Skill |
|------|------------|-------------|
| **역할** | 데이터 계층 | 지식 계층 |
| **기능** | AI가 결제 연동 문서를 실시간 검색 | AI의 행동 자체를 가이드하는 전문 지식 |
| **비유** | 결제 연동 문서 검색 엔진 | 결제 연동 전문가 매뉴얼 |
| **제공 형태** | npm 패키지 (`@mobilpay/mcp-server`) | IDE별 설정 파일 |

> **함께 사용하면?** MCP가 정확한 API 명세를 조회하고, Skill이 보안 규칙과 베스트 프랙티스를 자동 적용합니다. 테스트 결과 함께 사용 시 코드 정확도가 **100%**로, Skill 미적용 대비 **+43%** 향상되었습니다.

---

### MCP란?

MCP(Model Context Protocol)는 Anthropic이 정의한 개방형 표준으로, AI 모델이 외부 데이터 소스와 도구에 안전하게 접근할 수 있도록 해주는 프로토콜입니다.

MOBILPAY MCP 서버는 **27개의 결제 연동 문서**(MOBILPAY 18개 + NEZO 9개)를 인덱싱하여 AI 모델에 제공합니다.

---

### 지원 도구

| 도구 | MCP | Skill | 설명 |
|------|-----|-------|------|
| **Cursor** | O | O | AI 기반 코드 에디터 |
| **Kiro** | O | O | AWS의 AI IDE |
| **Windsurf** | O | - | AI 코딩 어시스턴트 |
| **Claude Desktop** | O | - | Anthropic의 Claude 데스크톱 앱 |
| **VS Code (Copilot)** | O | O | GitHub Copilot MCP 확장 |
| **Claude Code** | O | O | CLI 기반 AI 코딩 에이전트 |

---

### MCP 설치 및 설정

> **사전 요구사항:** Node.js 18 이상이 설치되어 있어야 합니다.

#### IDE별 MCP 설정 비교

| IDE | 최상위 키 | 파일 위치 |
|-----|----------|----------|
| Cursor | `mcpServers` | `.cursor/mcp.json` |
| Kiro | `mcpServers` | `.kiro/settings/mcp.json` |
| Windsurf | `mcpServers` | `~/.codeium/windsurf/mcp_config.json` |
| Claude Desktop | `mcpServers` | `claude_desktop_config.json` |
| VS Code (Copilot) | `servers` | `.vscode/mcp.json` |
| Claude Code | (CLI 명령) | `claude mcp add ...` |

> **주의:** VS Code는 최상위 키가 `"servers"`입니다 (`"mcpServers"`가 아닙니다).

#### Cursor

프로젝트 루트에 `.cursor/mcp.json` 파일을 생성합니다.

```json
{
  "mcpServers": {
    "mobilpay": {
      "command": "npx",
      "args": ["-y", "@mobilpay/mcp-server@latest"]
    }
  }
}
```

글로벌 설정: `~/.cursor/mcp.json` 파일에 위 내용을 추가하면 모든 프로젝트에서 사용할 수 있습니다.

#### Kiro

프로젝트 루트에 `.kiro/settings/mcp.json` 파일을 생성합니다.

```json
{
  "mcpServers": {
    "mobilpay": {
      "command": "npx",
      "args": ["-y", "@mobilpay/mcp-server@latest"]
    }
  }
}
```

#### Windsurf

`~/.codeium/windsurf/mcp_config.json` 파일에 추가합니다.

```json
{
  "mcpServers": {
    "mobilpay": {
      "command": "npx",
      "args": ["-y", "@mobilpay/mcp-server@latest"]
    }
  }
}
```

#### Claude Desktop

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mobilpay": {
      "command": "npx",
      "args": ["-y", "@mobilpay/mcp-server@latest"]
    }
  }
}
```

#### VS Code (GitHub Copilot)

프로젝트 루트에 `.vscode/mcp.json` 파일을 생성합니다.

```json
{
  "servers": {
    "mobilpay": {
      "command": "npx",
      "args": ["-y", "@mobilpay/mcp-server@latest"]
    }
  }
}
```

VS Code 설정에서 `"chat.mcp.enabled": true` 추가가 필요합니다.

#### Claude Code

```bash
claude mcp add mobilpay -- npx -y @mobilpay/mcp-server@latest
```

---

### 제공 도구 (MCP Tools)

MOBILPAY MCP 서버는 **6개**의 도구를 제공합니다.

#### get-docs (통합)

키워드 기반으로 MOBILPAY + NEZO 결제 연동 문서를 통합 검색합니다. BM25 알고리즘 사용.

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `keywords` | `string[]` | 예 | 검색 키워드 배열 |

#### document-by-id (통합)

문서 ID로 전체 문서를 조회합니다. `id=0`이면 전체 27개 문서 목록을 반환합니다.

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `id` | `number` | 예 | 문서 ID (0: 목록) |

#### get-payment-api-spec (MOBILPAY)

MOBILPAY API의 전체 명세를 조회합니다.

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `api_name` | `string` | 예 | API 이름 |

**사용 가능한 api_name:** `registration`, `payment-window`, `auth-response`, `approval-tid`, `approval-mobilid`, `purchase`, `virtual-account`, `cancel`, `refund`, `cash-receipt`, `hmac`

#### get-payment-code-example (MOBILPAY)

MOBILPAY API별 언어별 예제 코드를 조회합니다.

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `api_name` | `string` | 예 | API 이름 |
| `language` | `string` | 아니오 | 언어 필터: `java`, `python`, `node`, `php`, `csharp` |

#### get-nezo-api-spec (NEZO)

내죠여왕(NEZO) API의 전체 명세를 조회합니다.

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `api_name` | `string` | 예 | API 이름 |

**사용 가능한 api_name:** `send`, `callback`, `search`, `cancel`, `resend`

#### get-nezo-code-example (NEZO)

내죠여왕(NEZO) API별 언어별 예제 코드를 조회합니다.

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `api_name` | `string` | 예 | API 이름 |
| `language` | `string` | 아니오 | 언어 필터: `java`, `python`, `node`, `php`, `csharp` |

---

### llms.txt

AI 모델이 직접 참조할 수 있는 문서 인덱스 파일:

```
https://www.mobilians.co.kr/doc/llms.txt
```

---

### 사용 예시

| 요청 | 서비스 | 사용되는 MCP Tool |
|------|--------|------------------|
| "MOBILPAY 거래등록 API 연동해줘" | MOBILPAY | `get-payment-api-spec` |
| "HMAC 검증 코드를 Python으로 작성해줘" | MOBILPAY | `get-payment-code-example` |
| "noti_url 핸들러 구현해줘" | MOBILPAY | `get-payment-api-spec` |
| "내죠여왕 결제요청 코드 작성해줘" | NEZO | `get-nezo-api-spec` |
| "알림톡 콜백 핸들러 만들어줘" | NEZO | `get-nezo-api-spec`, `get-nezo-code-example` |
| "MAC 생성 코드를 Java로 작성해줘" | NEZO | `get-nezo-code-example` |
| "결제 관련 문서 검색해줘" | 통합 | `get-docs` |

---

### Agent Skill

Agent Skill은 AI의 행동을 가이드하는 도메인 전문 지식 패키지입니다.

#### IDE별 Skill 설정 방법

| 항목 | Cursor | Kiro | VS Code Copilot | Claude Code |
|------|--------|------|-----------------|-------------|
| **Skill 형식** | `.mdc` (frontmatter) | `.md` (plain) | `.md` (단일 파일) | `SKILL.md` (frontmatter) |
| **파일 위치** | `.cursor/rules/` | `.kiro/steering/` | `.github/` | `skills/*/SKILL.md` |
| **조건부 적용** | 가능 (alwaysApply, globs) | 불가 (항상 로드) | 불가 (항상 로드) | 가능 (description 기반) |
| **추가 설정** | .mdc 파일 배치 | steering 파일 배치 | instructions 파일 생성 | 불필요 |

#### Cursor (.cursor/rules/*.mdc)

`.cursor/rules/` 디렉토리에 `.mdc` 파일을 배치합니다. YAML frontmatter로 적용 조건을 제어할 수 있습니다.

```
프로젝트 루트/
├── .cursor/
│   ├── mcp.json
│   └── rules/
│       ├── mobilpay-integration.mdc
│       └── nezo-integration.mdc
```

frontmatter에서 `alwaysApply: false`로 설정하면 Agent-Requested 모드로 동작합니다. "MOBILPAY", "결제 연동" 등의 키워드를 감지하면 자동으로 규칙이 활성화됩니다.

**다운로드:** `downloads/cursor/` 디렉토리의 파일을 프로젝트의 `.cursor/`에 복사하세요.

#### Kiro (.kiro/steering/*.md)

`.kiro/steering/` 디렉토리에 일반 마크다운 파일을 배치합니다. frontmatter가 필요 없습니다.

```
프로젝트 루트/
├── .kiro/
│   ├── settings/
│   │   └── mcp.json
│   └── steering/
│       ├── mobilpay-integration.md
│       └── nezo-integration.md
```

Steering 파일은 항상 컨텍스트로 제공되므로 조건부 적용이 불가합니다.

**다운로드:** `downloads/kiro/` 디렉토리의 파일을 프로젝트의 `.kiro/`에 복사하세요.

#### VS Code + GitHub Copilot (.github/copilot-instructions.md)

`.github/copilot-instructions.md` 단일 파일에 MOBILPAY와 NEZO 규칙을 통합합니다.

```
프로젝트 루트/
├── .vscode/
│   └── mcp.json
├── .github/
│   └── copilot-instructions.md
```

설정 활성화: `github.copilot.chat.codeGeneration.useInstructionFiles` 체크박스를 활성화하세요.

> **주의:** MCP 설정 파일의 최상위 키는 `"servers"`입니다.

**다운로드:** `downloads/vscode-copilot/` 디렉토리의 파일을 프로젝트에 복사하세요.

#### Claude Code (추가 설정 불필요)

Claude Code는 `skills/` 디렉토리의 `SKILL.md` 파일을 네이티브로 인식합니다. 별도의 변환이나 설정이 필요 없습니다.

- `skills/mobilpay-integration/SKILL.md` — MOBILPAY 결제 연동 스킬
- `skills/nezo-integration/SKILL.md` — 내죠여왕 알림톡 결제 스킬
- `skills/*/references/` — 상세 API 문서 (자동 참조)

Claude Code의 장점: Reference 직접 참조, 변환 불필요, 평가(evals) 지원.

---

### MCP + Skill 함께 사용하기

1. **사용자가 질문** — "MOBILPAY 카카오페이 연동 코드 작성해줘"
2. **Skill 적용** — 결제 플로우, 보안 규칙, 체크리스트 자동 로드
3. **MCP 검색** — 거래등록 API 명세, 간편결제 파라미터 조회
4. **코드 생성** — 정확한 파라미터 + 보안 규칙이 모두 적용된 코드

#### 벤치마크 결과

| 구성 | 정확도 | 설명 |
|------|--------|------|
| **MCP + Skill** | **100%** | 보안 규칙, 파라미터, 응답 포맷 모두 정확 |
| MCP만 사용 | 57% | API 명세는 정확하나 보안 규칙 누락 발생 |
| AI 기본 지식만 | ~30% | 파라미터명 오류, 보안 규칙 미적용 |

---

### 보안 규칙

#### MOBILPAY REST API

| 규칙 | 설명 |
|------|------|
| **skey 보호** | skey(서비스 키)는 절대 클라이언트 코드에 포함하지 않습니다. 반드시 환경변수에서 로드. |
| **HMAC 서버사이드** | HMAC 무결성 검증은 반드시 서버에서만 수행. 메시지: amount + ok_url + trade_id + time_stamp |
| **noti_url 멱등성** | noti_url은 SUCCESS 수신까지 최대 20회 반복 호출. tid 기반 중복 처리 방어 로직 필수. |
| **결제승인 백엔드** | 결제승인 API(/MUP/api/approval)는 반드시 백엔드에서만 호출. |
| **호스트 구분** | 테스트: test.mobilians.co.kr / 운영: mup.mobilians.co.kr |

#### 내죠여왕(NEZO) 알림톡 결제

| 규칙 | 설명 |
|------|------|
| **svc_id & MAC_KEY 보호** | 절대 클라이언트 코드에 포함하지 않습니다. 반드시 환경변수에서 로드. |
| **MAC(HmacSHA256) 서버사이드** | 요청 KEY: svc_id + send_dttm + MAC_KEY, 응답 KEY: svc_id + sys_dttm + MAC_KEY. 64자리 대문자 HEX. |
| **callback_url 멱등성** | HTTP 200 미수신 시 재시도 발생. trade_no 기반 중복 방어 필수. |
| **결제 API 백엔드** | 결제요청/조회/취소 API는 반드시 서버 사이드에서만 호출. |
| **전문 유효시간 10분** | send_dttm 기준 10분 초과 시 오류. |
| **callback_url 형식** | 완전한 URL 형식 필수. (예: https://example.com/pay/callback) |
| **HTTP 200 응답 필수** | callback_url 핸들러는 반드시 HTTP 200을 반환해야 합니다. |

---

### FAQ

**Q. MCP와 Skill 중 무엇을 사용해야 하나요?**
둘 다 사용하는 것을 권장합니다. MCP는 정확한 API 명세를 조회하고, Skill은 보안 규칙과 베스트 프랙티스를 자동 적용합니다.

**Q. MCP 서버를 직접 설치해야 하나요?**
아닙니다. npx 명령어를 통해 자동으로 다운로드 및 실행됩니다. Node.js 18 이상 필요.

**Q. Skill은 어떤 AI 도구에서 사용할 수 있나요?**
Cursor(.cursor/rules/*.mdc), Kiro(.kiro/steering/*.md), VS Code Copilot(.github/copilot-instructions.md), Claude Code(네이티브 SKILL.md)에서 사용할 수 있습니다.

**Q. IDE별 Skill 파일 형식이 왜 다른가요?**
각 IDE가 자체적인 AI 가이드 시스템을 운영하기 때문입니다. 본 가이드에서 각 형식에 맞는 변환된 파일을 다운로드할 수 있습니다.

**Q. MOBILPAY와 내죠여왕(NEZO) 연동을 동시에 사용할 수 있나요?**
네. MCP 서버 하나로 두 서비스의 문서를 모두 검색할 수 있고, Skill 파일도 서비스별로 분리되어 있습니다.

**Q. MCP 서버가 외부로 데이터를 전송하나요?**
아닙니다. MCP 서버와 Skill 모두 로컬에서 실행되며, 외부 서버로의 네트워크 요청은 발생하지 않습니다.

**Q. MCP 서버의 문서는 최신 상태인가요?**
@latest 태그를 사용하면 npm에 게시된 최신 버전을 항상 사용할 수 있습니다.

**Q. 어떤 결제수단을 지원하나요?**
MOBILPAY: 휴대폰(MC), 신용카드(CN), 실계좌이체(RA), 가상계좌(VA), 간편결제. NEZO: 휴대폰(MC), 신용카드(CN).

---

### 기술지원

| 구분 | 연락처 |
|------|--------|
| 기술지원/모듈연동 | TEL 02-2192-2059 / svcop@kggroup.co.kr |
| 일반 고객 문의 | TEL 1800-0678 / help@kggroup.co.kr |
