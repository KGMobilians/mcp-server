# @mobilpay/mcp-server

[![npm version](https://img.shields.io/npm/v/@mobilpay/mcp-server)](https://www.npmjs.com/package/@mobilpay/mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

KG파이낸셜 결제서비스 연동을 위한 MCP(Model Context Protocol) 서버입니다.

AI 코딩 도구(Cursor, Claude Code, Kiro, VS Code, Windsurf, Claude Desktop 등)에서 자연어로 질문하면, 결제 연동 문서(27개)를 자동 검색하여 정확한 코드를 생성할 수 있습니다.

## 지원 서비스

| 서비스 | 설명 | 문서 수 |
|--------|------|---------|
| **MOBILPAY REST API** | 범용 결제 연동 (휴대폰/신용카드/계좌이체/가상계좌/간편결제/모바일티머니) | 18개 |
| **내죠여왕(NEZO)** | 카카오 알림톡 결제 요청 서비스 | 9개 |

## 설치 및 설정

- Node.js 18+ 필요 (ES2022 타겟)
- stdio 전송 방식 사용 — 네트워크 불필요, 오프라인 동작 가능

### Cursor

`.cursor/mcp.json`:

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

### Claude Code (CLI)

```bash
claude mcp add mobilpay -- npx -y @mobilpay/mcp-server@latest
```

### VS Code (GitHub Copilot)

`.vscode/mcp.json`:

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

### Windsurf

`.windsurf/mcp.json`:

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

### Kiro (AWS)

`.kiro/settings/mcp.json`:

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

### Claude Desktop

`claude_desktop_config.json`:

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

## 제공 Tool

### 공통

| Tool | 입력 | 기능 |
|------|------|------|
| `get-docs` | `keywords: string[]` | BM25 기반 통합 문서 검색 (결제연동 + 내죠여왕 27개 문서) |
| `document-by-id` | `id: number` | 문서 ID로 전체 내용 조회. `id=0`으로 문서 목록 확인 |

### MOBILPAY 결제연동

| Tool | 입력 | 기능 |
|------|------|------|
| `get-payment-api-spec` | `api_name: string` | MOBILPAY API 전체 명세 조회 |
| `get-payment-code-example` | `api_name, language?` | MOBILPAY 언어별 예제 코드 추출 |

### 내죠여왕(NEZO)

| Tool | 입력 | 기능 |
|------|------|------|
| `get-nezo-api-spec` | `api_name: string` | 내죠여왕 API 전체 명세 조회 |
| `get-nezo-code-example` | `api_name, language?` | 내죠여왕 언어별 예제 코드 추출 |

## 지원 문서

### MOBILPAY REST API

| 분류 | 문서 |
|------|------|
| API | 거래등록(티머니페이 포함), 결제창 호출, 인증/승인 응답, 결제승인(TID), 수동매입, 가상계좌, 결제취소(`/MUP/api/cancellation`), 환불, 에스크로 배송등록, 현금영수증, HMAC 무결성 검증 |
| 가이드 | 적용가이드, 일반결제 플로우, 하이브리드결제 플로우, noti_url 처리, 방화벽 설정 |
| 레퍼런스 | 결제수단/카드사/금융기관 코드표, 에러코드표 |

### 내죠여왕(NEZO)

| 분류 | 문서 |
|------|------|
| API | 결제 요청(/send), 콜백/리턴 URL, 결제 조회(/send/view), 결제 취소(/cancel), 결제 재요청 |
| 가이드 | 시작하기, 방화벽 설정 |
| 레퍼런스 | 공통 응답 코드, MAC 생성/검증 가이드 |

## 사용 예시

AI 코딩 도구에서 다음과 같이 질문하면 됩니다:

### MOBILPAY
- "MOBILPAY 휴대폰 결제 연동 코드 작성해줘"
- "거래등록 API 전체 명세 보여줘"
- "HMAC 검증 Python 예제 코드 알려줘"
- "결제 취소 API 파라미터가 뭐야?"

### 내죠여왕
- "내죠여왕 알림톡 결제 요청 코드 작성해줘"
- "내죠여왕 콜백 핸들러 Node.js로 구현해줘"
- "내죠여왕 MAC 생성 Java 예제 보여줘"
- "내죠여왕 결제 조회 후 취소하는 코드 만들어줘"

## 보안 규칙

MCP 서버가 코드 생성 시 다음 규칙을 자동으로 적용합니다:

### MOBILPAY
1. `skey`(서비스키)는 절대 클라이언트 코드에 포함 금지 — 환경변수에서 로드
2. HMAC 무결성 검증은 반드시 서버 사이드에서 처리 — 엔드포인트별 메시지 구성 상이 (거래등록/승인 / 취소·환불 / 에스크로 배송등록)
3. `noti_url` 처리 시 중복 거래 방어 로직(`tid` 기반 멱등성) 필수
4. 결제 승인 API(`/MUP/api/approval`)는 반드시 백엔드에서 호출
5. 결제 취소/환불은 해시 검증이 있는 `/MUP/api/cancellation` 사용 (구 `/cancel` 금지)
6. 테스트: `test.mobilians.co.kr` / 운영: `mup.mobilians.co.kr`

### 내죠여왕
1. `svc_id`와 `MAC_KEY`는 절대 클라이언트 코드에 포함 금지 — 환경변수에서 로드
2. HmacSHA256 MAC 생성/검증은 반드시 서버 사이드에서 처리
3. `callback_url` 핸들러에 중복 거래 방어 로직(`trade_no` 기반 멱등성) 필수
4. 테스트: `test.mpps.co.kr` / 운영: `www.nezo.co.kr`

## 동작 원리

```
AI 도구 → MCP 프로토콜 → 6개 Tool 중 선택 → 문서 검색/조회 → 결과 반환
                          ├── get-docs                → 통합 BM25 키워드 검색
                          ├── document-by-id           → 문서 ID 기반 조회
                          ├── get-payment-api-spec     → MOBILPAY API 명세
                          ├── get-payment-code-example → MOBILPAY 코드 예제
                          ├── get-nezo-api-spec        → 내죠여왕 API 명세
                          └── get-nezo-code-example    → 내죠여왕 코드 예제
```

서버 시작 시 번들된 마크다운 문서(27개)를 청크 분할 후 BM25 인덱스를 구축합니다.
