# AI 연동 가이드

## MCP + Skills로 결제 연동하기

MOBILPAY는 AI 코딩 도구에서 결제 연동을 빠르고 정확하게 수행할 수 있도록 **MCP 서버**와 **Agent Skill** 두 가지를 제공합니다. 각각 독립적으로 사용할 수도 있고, 함께 사용하면 최대 효과를 얻을 수 있습니다.

---

### MCP와 Skills 한눈에 보기

| 구분 | MCP Server | Agent Skill |
|------|------------|-------------|
| **역할** | 데이터 계층 | 지식 계층 |
| **기능** | AI가 결제 연동 문서를 실시간 검색 | AI의 행동 자체를 가이드하는 전문 지식 |
| **비유** | 결제 연동 문서 검색 엔진 | 결제 연동 전문가 매뉴얼 |
| **제공 형태** | npm 패키지 (`@mobilpay/mcp-server`) | `.skill` 파일 / SKILL.md |

> **함께 사용하면?** MCP가 정확한 API 명세를 조회하고, Skill이 보안 규칙과 베스트 프랙티스를 자동 적용합니다. 테스트 결과 함께 사용 시 코드 정확도가 **100%**로, Skill 미적용 대비 **+43%** 향상되었습니다.

---

### MCP란?

MCP(Model Context Protocol)는 Anthropic이 정의한 개방형 표준으로, AI 모델이 외부 데이터 소스와 도구에 안전하게 접근할 수 있도록 해주는 프로토콜입니다.

MOBILPAY MCP 서버는 18개의 결제 연동 문서(API 레퍼런스, 연동 가이드, 코드표)를 인덱싱하여 AI 모델에 제공합니다. 이를 통해 AI가 MOBILPAY 결제 연동에 필요한 정확한 정보를 기반으로 코드를 생성하고, 연동 질문에 답변할 수 있습니다.

---

### 지원 도구

다음 AI 코딩 도구에서 MOBILPAY MCP 서버를 사용할 수 있습니다.

| 도구 | 설명 |
|------|------|
| **Cursor** | AI 기반 코드 에디터 |
| **Windsurf** | AI 코딩 어시스턴트 |
| **Claude Desktop** | Anthropic의 Claude 데스크톱 앱 |
| **VS Code (Copilot)** | GitHub Copilot MCP 확장 |
| **Claude Code** | CLI 기반 AI 코딩 에이전트 |

---

### 설치 및 설정

MOBILPAY MCP 서버는 npm 패키지로 제공됩니다. 별도의 설치 없이 `npx`를 통해 바로 실행할 수 있습니다.

> **사전 요구사항:** Node.js 18 이상이 설치되어 있어야 합니다.

#### Cursor

Cursor에서 MCP 서버를 설정하는 방법입니다.

**방법 1: 프로젝트 단위 설정**

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

**방법 2: 글로벌 설정**

`~/.cursor/mcp.json` 파일에 위 내용을 추가하면 모든 프로젝트에서 사용할 수 있습니다.

#### Windsurf

Windsurf 설정 파일에 MCP 서버를 추가합니다.

`~/.codeium/windsurf/mcp_config.json` 파일을 열고 다음을 추가합니다.

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

Claude Desktop 앱의 설정 파일에 MCP 서버를 추가합니다.

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

VS Code의 설정(settings.json)에 다음을 추가합니다.

```json
{
  "mcp": {
    "servers": {
      "mobilpay": {
        "command": "npx",
        "args": ["-y", "@mobilpay/mcp-server@latest"]
      }
    }
  }
}
```

또는 프로젝트 루트에 `.vscode/mcp.json` 파일을 생성합니다.

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

#### Claude Code

터미널에서 다음 명령어를 실행합니다.

```bash
claude mcp add mobilpay -- npx -y @mobilpay/mcp-server@latest
```

---

### 제공 도구 (MCP Tools)

MOBILPAY MCP 서버는 4개의 도구를 제공합니다.

#### get-mobilpay-docs

키워드 기반으로 MOBILPAY 결제 연동 문서를 검색합니다. BM25 알고리즘을 사용하여 가장 관련성 높은 문서 청크를 반환합니다.

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `keywords` | `string[]` | 예 | 검색 키워드 배열. 예: `["거래등록", "sid"]` |

**검색 가능 문서:** 거래등록, 결제창 호출, 인증/승인 응답, 결제승인(TID/MOBILID), 수동매입, 가상계좌, 결제취소, 환불, 현금영수증, HMAC 검증, 결제플로우(일반/하이브리드), noti_url 처리, 방화벽 설정, 에러코드표, 코드표

#### get-api-spec

특정 MOBILPAY API의 전체 명세를 조회합니다. 요청/응답 파라미터와 예제 코드를 포함한 전체 문서를 반환합니다.

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `api_name` | `string` | 예 | API 이름. 예: `registration`, `cancel`, `hmac` |

**사용 가능한 api_name:**

| api_name | 설명 |
|----------|------|
| `registration` | 거래등록 API |
| `payment-window` | 결제창 호출 |
| `auth-response` | 인증/승인 응답 |
| `approval-tid` | 결제승인 (TID 방식) |
| `approval-mobilid` | 결제승인 (MOBILID 방식) |
| `purchase` | 수동매입 |
| `virtual-account` | 가상계좌 |
| `cancel` | 결제취소 |
| `refund` | 환불 |
| `cash-receipt` | 현금영수증 |
| `hmac` | HMAC 무결성 검증 |

#### document-by-id

문서 ID로 전체 문서를 조회합니다. `get-mobilpay-docs` 검색 결과에서 특정 문서의 전체 내용이 필요할 때 사용합니다.

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `id` | `number` | 예 | 문서 ID. `0`을 입력하면 전체 문서 목록을 반환합니다. |

#### get-code-example

API별 언어별 예제 코드를 조회합니다.

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `api_name` | `string` | 예 | API 이름. 예: `hmac`, `registration` |
| `language` | `string` | 아니오 | 프로그래밍 언어 필터. `java`, `python`, `node`, `php`, `csharp` |

---

### llms.txt

AI 모델이 직접 참조할 수 있는 문서 인덱스 파일도 제공합니다.

```
https://www.mobilians.co.kr/doc/llms.txt
```

이 파일은 MOBILPAY 결제 연동에 필요한 18개 문서의 목록과 요약을 포함하고 있어, llms.txt 표준을 지원하는 AI 도구에서 직접 활용할 수 있습니다.

---

### 사용 예시

MCP 서버를 설정한 후, AI 코딩 도구에서 자연어로 질문하면 됩니다.

**예시 1: 결제 연동 시작하기**

> "MOBILPAY 신용카드 결제 연동을 시작하려고 합니다. 거래등록부터 결제 완료까지 전체 플로우를 알려주세요."

**예시 2: 특정 API 코드 생성**

> "MOBILPAY 거래등록 API를 Node.js로 호출하는 코드를 작성해주세요. 신용카드 결제로 10,000원을 결제합니다."

**예시 3: 에러 해결**

> "MOBILPAY 결제 연동 중 에러코드 M110이 발생했습니다. 원인과 해결 방법을 알려주세요."

**예시 4: HMAC 검증 구현**

> "MOBILPAY HMAC 무결성 검증 코드를 Python으로 작성해주세요."

**예시 5: noti_url 구현**

> "결제 완료 후 noti_url로 결과를 수신하는 서버 코드를 작성해주세요. 중복 호출 방어 로직도 포함해주세요."

---

### 보안 규칙

MCP 서버는 AI 모델이 코드를 생성할 때 다음 보안 규칙을 준수하도록 안내합니다.

| 규칙 | 설명 |
|------|------|
| **skey 보호** | `skey`(서비스 키)는 절대 클라이언트 코드에 포함하지 않습니다. 반드시 환경변수에서 로드합니다. |
| **HMAC 서버사이드** | HMAC 무결성 검증은 반드시 서버에서만 수행합니다. |
| **noti_url 멱등성** | `noti_url` 핸들러에는 `tid` 기반 중복 처리 방어 로직을 포함합니다. |
| **결제승인 백엔드** | 결제승인 API(`/MUP/api/approval`)는 반드시 백엔드에서만 호출합니다. |
| **호스트 구분** | 테스트: `test.mobilians.co.kr` / 운영: `mup.mobilians.co.kr` |

---

### FAQ

**Q. MCP 서버를 직접 설치해야 하나요?**

아닙니다. `npx` 명령어를 통해 자동으로 다운로드 및 실행되므로 별도 설치가 필요 없습니다. 단, Node.js 18 이상이 필요합니다.

**Q. MCP 서버가 외부로 데이터를 전송하나요?**

아닙니다. MCP 서버는 로컬에서 실행되며, 문서 검색과 코드 예제 제공만 수행합니다. 외부 서버로의 네트워크 요청은 발생하지 않습니다.

**Q. MCP 서버의 문서는 최신 상태인가요?**

`@latest` 태그를 사용하면 npm에 게시된 최신 버전의 문서를 항상 사용할 수 있습니다. 특정 버전을 고정하려면 `@mobilpay/mcp-server@1.1.0`과 같이 버전을 명시하세요.

**Q. 어떤 결제수단을 지원하나요?**

휴대폰(MC), 신용카드(CN), 실계좌이체(RA), 가상계좌(VA)를 지원합니다.

---

---

### Agent Skill

Agent Skill은 AI의 행동을 가이드하는 도메인 전문 지식 패키지입니다. MCP가 문서를 검색해주는 "검색 엔진"이라면, Skill은 AI가 코드를 작성할 때 보안 규칙과 결제 플로우를 자동으로 적용하게 해주는 "전문가 매뉴얼"입니다.

#### Skill이란?

Anthropic이 공개한 개방형 표준으로, `SKILL.md` 파일 하나에 AI가 특정 도메인 작업을 수행할 때 따라야 할 규칙, 절차, 참고 문서를 정의합니다.

#### MOBILPAY Skill이 제공하는 것

| 기능 | 설명 |
|------|------|
| **결제 플로우 자동 설계** | 일반결제/하이브리드결제 플로우를 자동으로 파악하고 전체 구현 단계를 가이드 |
| **보안 규칙 5가지 자동 적용** | skey 환경변수, HMAC 서버사이드, noti_url 멱등성, 결제승인 백엔드, 호스트 분기 |
| **코드 생성 후 체크리스트** | 8가지 항목(금액 검증, 중복 방어, SUCCESS 출력 등) 자동 검증 |
| **결제수단별 옵션 가이드** | 결제수단별 올바른 파라미터 접두어와 필수값 안내 |
| **18개 참조 문서 번들링** | API 레퍼런스 11개, 연동 가이드 5개, 코드표/에러코드 2개 내장 |

#### Skill 설치 방법

**Claude Code**

```bash
# .skill 파일 다운로드 후 설치
claude skill install mobilpay-integration.skill

# 또는 .claude/skills/ 디렉토리에 직접 배치
```

**Cursor**

프로젝트 루트에 `.cursorrules` 파일을 생성하고 SKILL.md 내용을 붙여넣습니다.

**Windsurf**

프로젝트 루트에 `.windsurfrules` 파일을 생성하고 SKILL.md 내용을 붙여넣습니다.

**Claude Desktop (Cowork)**

`.skill` 파일을 다운로드한 후, Cowork 모드에서 설치합니다.

---

### MCP + Skill 함께 사용하기

MCP와 Skill을 함께 설정하면 AI가 두 가지를 동시에 활용하여 가장 정확한 연동 코드를 생성합니다.

#### 동작 방식

1. **사용자가 질문** — "MOBILPAY 카카오페이 연동 코드 작성해줘"
2. **Skill 적용** — 결제 플로우, 보안 규칙, 체크리스트 자동 로드
3. **MCP 검색** — 거래등록 API 명세, 간편결제 파라미터 조회
4. **코드 생성** — 정확한 파라미터 + 보안 규칙이 모두 적용된 코드

#### Claude Code에서 동시 설정

```bash
# Step 1: MCP 서버 추가
claude mcp add mobilpay -- npx -y @mobilpay/mcp-server@latest

# Step 2: Skill 설치
claude skill install mobilpay-integration.skill
```

#### Cursor에서 동시 설정

1. `.cursor/mcp.json`에 MCP 서버 설정 추가
2. `.cursorrules`에 SKILL.md 내용 붙여넣기

#### 벤치마크 결과

| 구성 | 정확도 | 설명 |
|------|--------|------|
| **MCP + Skill** | **100%** | 보안 규칙, 파라미터, 응답 포맷 모두 정확 |
| MCP만 사용 | 57% | API 명세는 정확하나 보안 규칙 누락 발생 |
| AI 기본 지식만 | ~30% | 파라미터명 오류, 보안 규칙 미적용 |

---

### 기술지원

MCP 서버 사용 중 문제가 발생하면 아래로 문의해 주세요.

| 구분 | 연락처 |
|------|--------|
| 기술지원/모듈연동 | TEL 02-2192-2059 / svcop@kggroup.co.kr |
| 일반 고객 문의 | TEL 1800-0678 / help@kggroup.co.kr |
