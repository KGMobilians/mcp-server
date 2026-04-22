# 보안성 검토 보고서

**대상:** `developer-site-new/McpIntegrationGuide.vue` 및 관련 파일
**검토일:** 2026-04-17
**검토자:** AI Security Review

---

## 검토 범위

| 파일 | 유형 | 설명 |
|------|------|------|
| `McpIntegrationGuide.vue` | Vue SFC | 메인 가이드 페이지 컴포넌트 |
| `downloads/**` | 정적 파일 | IDE별 설정 샘플 파일 (8개) |
| `mcp-integration-guide.md` | Markdown | 가이드 마크다운 문서 |
| `INTEGRATION-README.md` | Markdown | 통합 가이드 문서 |

---

## 검토 항목 및 결과

### 1. XSS (Cross-Site Scripting) — PASS

| 항목 | 결과 | 상세 |
|------|------|------|
| `v-html` 사용 여부 | 미사용 | 동적 HTML 렌더링 없음. 모든 동적 데이터는 `{{ }}` 텍스트 보간 사용 |
| 사용자 입력 처리 | 해당 없음 | 사용자 입력을 받는 폼/입력 필드 없음 |
| URL 파라미터 반영 | 해당 없음 | URL 쿼리 파라미터를 DOM에 반영하지 않음 |
| 이벤트 핸들러 | 안전 | `@click`만 사용, 사용자 입력 미포함 |

**Vue.js의 `{{ }}` 보간은 자동으로 HTML 이스케이프를 수행하므로 XSS 공격 벡터가 없습니다.**

### 2. 민감 정보 노출 — PASS

| 항목 | 결과 | 상세 |
|------|------|------|
| API 키/시크릿 하드코딩 | 없음 | 코드에 실제 skey, MAC_KEY 등 미포함 |
| 내부 서버 주소 노출 | 없음 | 공개 도메인(mobilians.co.kr 등)만 참조 |
| 인증 정보 | 없음 | 로그인/인증 관련 코드 없음 |
| 다운로드 파일 내 시크릿 | 없음 | 모든 샘플 파일에 실제 키값 미포함 |

**보안 규칙 섹션에서 "환경변수에서 로드" 가이드를 명확히 안내하고 있습니다.**

### 3. 외부 링크 보안 — PASS

| 링크 | target | rel | 결과 |
|------|--------|-----|------|
| `https://llmstxt.org` | `_blank` | `noopener noreferrer` | 안전 |
| `mailto:svcop@kggroup.co.kr` | 없음 | 없음 | 안전 (mailto) |
| `mailto:help@kggroup.co.kr` | 없음 | 없음 | 안전 (mailto) |

**`target="_blank"` 사용 시 `rel="noopener noreferrer"`가 올바르게 적용되어 있습니다.**

### 4. Clipboard API 사용 — 수정 필요

| 항목 | 결과 | 상세 |
|------|------|------|
| `navigator.clipboard.writeText()` | 수정 필요 | HTTPS가 아닌 환경에서 `navigator.clipboard`가 undefined일 수 있음 |

**이슈:**
- `navigator.clipboard`는 Secure Context(HTTPS)에서만 사용 가능
- HTTP 환경이나 일부 브라우저에서 `navigator.clipboard`가 `undefined`일 경우 런타임 에러 발생 가능
- **위험도: LOW** — 개발자사이트가 HTTPS로 서빙될 것으로 예상되나, 방어적 코드가 필요

**수정 방안:**
```javascript
// 수정 전
navigator.clipboard.writeText(text).then(...)

// 수정 후
if (navigator.clipboard && navigator.clipboard.writeText) {
  navigator.clipboard.writeText(text).then(...)
} else {
  // fallback: textarea를 이용한 복사
}
```

### 5. 다운로드 파일 경로 조작 — PASS (조건부)

| 항목 | 결과 | 상세 |
|------|------|------|
| `downloadBase` 변수 | 정적 값 | data()에서 `/downloads`로 초기화, 외부 입력 미반영 |
| 경로 조합 | 안전 | 고정 문자열 결합 (`downloadBase + '/cursor/mcp.json'`) |

**`downloadBase`가 외부 입력(URL 파라미터, 사용자 입력)으로부터 설정되지 않으므로 경로 조작 위험 없음.**
다만, 운영 배포 시 `downloadBase`를 변경할 때는 신뢰할 수 있는 도메인만 사용해야 합니다.

### 6. 의존성 및 서드파티 — PASS

| 항목 | 결과 | 상세 |
|------|------|------|
| 외부 CDN/스크립트 로드 | 없음 | 모든 리소스가 로컬 |
| 서드파티 라이브러리 | 없음 | Vue.js 프레임워크만 사용 |
| 외부 API 호출 | 없음 | 네트워크 요청 없음 |

### 7. CSRF/인증 — 해당 없음

이 컴포넌트는 읽기 전용 가이드 페이지로, 상태 변경 요청이나 인증이 필요한 기능이 없습니다.

### 8. 다운로드 파일 내용 검증 — PASS

| 파일 | 검증 항목 | 결과 |
|------|-----------|------|
| `cursor/mcp.json` | 실행 명령어 검증 | `npx -y @mobilpay/mcp-server@latest` — 공개 npm 패키지, 안전 |
| `cursor/rules/*.mdc` | 스크립트 삽입 여부 | Markdown + YAML frontmatter만 포함, 실행 가능 코드 없음 |
| `kiro/settings/mcp.json` | 실행 명령어 검증 | 동일 npm 패키지, 안전 |
| `kiro/steering/*.md` | 스크립트 삽입 여부 | 순수 Markdown, 안전 |
| `vscode-copilot/vscode/mcp.json` | JSON 키 형식 | `"servers"` 키 사용 (VS Code 전용), 정확 |
| `vscode-copilot/github/copilot-instructions.md` | 스크립트 삽입 여부 | 순수 Markdown, 안전 |

**모든 다운로드 파일은 정적 설정/문서 파일로, 실행 가능한 악성 코드가 포함되어 있지 않습니다.**

---

## 발견된 이슈 요약

| # | 위험도 | 항목 | 설명 | 상태 |
|---|--------|------|------|------|
| 1 | LOW | Clipboard API fallback | `navigator.clipboard` 미지원 환경에서 런타임 에러 가능 | **수정 완료** |
| 2 | INFO | 다운로드 경로 | 운영 배포 시 `downloadBase`를 신뢰할 수 있는 도메인으로 설정 필요 | 참고 |

---

## 결론

**전체 보안 등급: PASS**

이 컴포넌트는 읽기 전용 가이드 페이지로, 사용자 입력 처리, 인증, 외부 API 호출이 없어 공격 표면이 매우 작습니다. XSS, CSRF, 민감 정보 노출 등 주요 보안 위협에 대해 안전합니다. Clipboard API fallback 이슈(LOW)를 수정하여 모든 환경에서 안정적으로 동작하도록 개선했습니다.
