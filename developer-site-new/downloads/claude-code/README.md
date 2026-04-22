# Claude Code - 추가 설정 불필요

Claude Code는 프로젝트의 `skills/` 디렉토리에 있는 `SKILL.md` 파일을 네이티브로 인식합니다.

## 자동 인식 항목

- `skills/mobilpay-integration/SKILL.md` — MOBILPAY 결제 연동 스킬
- `skills/nezo-integration/SKILL.md` — 내죠여왕 알림톡 결제 스킬
- `skills/*/references/` — 상세 API 문서 (자동 참조)
- `skills/*/evals/evals.json` — 스킬 품질 평가 데이터

## MCP 서버 추가 (선택)

```bash
claude mcp add mobilpay -- npx -y @mobilpay/mcp-server@latest
```

MCP 서버 없이도 `references/` 디렉토리의 문서를 직접 읽을 수 있으므로 선택사항입니다.
