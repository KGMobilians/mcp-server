# AI 연동 페이지 적용 가이드

개발자사이트(Vue.js)에 "AI 연동" 메뉴를 추가하기 위한 가이드입니다. 이 페이지는 MCP 서버와 Agent Skill 설정 방법, IDE별 상세 가이드, 샘플 파일 다운로드를 포함합니다.

---

## 1. 파일 배치

`McpIntegrationGuide.vue` 파일을 개발자사이트 프로젝트의 페이지 디렉토리에 복사합니다.

```
src/
├── views/           (또는 pages/)
│   ├── ...기존 페이지들
│   └── McpIntegrationGuide.vue   ← 여기에 추가
```

> 프로젝트 구조에 따라 `src/views/`, `src/pages/`, 또는 `src/components/pages/` 등 적절한 위치에 배치하세요.

---

## 2. 다운로드 파일 호스팅

`downloads/` 디렉토리의 파일들을 정적 파일로 서빙합니다. 개발자사이트 빌드 환경에 맞게 `public/` 또는 `static/` 디렉토리에 배치하세요.

```
public/ (또는 static/)
├── downloads/
│   ├── cursor/
│   │   ├── mcp.json
│   │   └── rules/
│   │       ├── mobilpay-integration.mdc
│   │       └── nezo-integration.mdc
│   ├── kiro/
│   │   ├── settings/
│   │   │   └── mcp.json
│   │   └── steering/
│   │       ├── mobilpay-integration.md
│   │       └── nezo-integration.md
│   ├── vscode-copilot/
│   │   ├── vscode/
│   │   │   └── mcp.json
│   │   └── github/
│   │       └── copilot-instructions.md
│   └── claude-code/
│       └── README.md
```

### 다운로드 경로 설정

`McpIntegrationGuide.vue` 컴포넌트의 `downloadBase` 변수를 실제 다운로드 경로에 맞게 수정하세요.

```javascript
// 기본값
downloadBase: '/downloads',

// 서브디렉토리에 배치한 경우
downloadBase: '/doc/downloads',
```

---

## 3. 라우터 설정

`src/router/index.js` (또는 `router.js`)에 라우트를 추가합니다.

### Vue Router 3.x (Vue 2)

```javascript
import McpIntegrationGuide from '@/views/McpIntegrationGuide.vue'

const routes = [
  // ... 기존 라우트들
  {
    path: '/doc/guide/ai-integration',
    name: 'AiIntegration',
    component: McpIntegrationGuide,
    meta: {
      title: 'AI 연동 | MOBILPAY 개발자센터'
    }
  },
]
```

### Vue Router 4.x (Vue 3)

```javascript
const routes = [
  // ... 기존 라우트들
  {
    path: '/doc/guide/ai-integration',
    name: 'AiIntegration',
    component: () => import('@/views/McpIntegrationGuide.vue'),
    meta: {
      title: 'AI 연동 | MOBILPAY 개발자센터'
    }
  },
]
```

---

## 4. 좌측 메뉴에 추가

사이드바 메뉴에서 "연동준비" 항목 바로 아래에 "AI 연동" 메뉴를 추가합니다.

### 메뉴 데이터 배열 방식

```javascript
const menuItems = [
  // ... 기존 메뉴
  {
    name: '연동준비',
    path: '/doc/guide/integration-prepare',
  },
  // ↓ 추가
  {
    name: 'AI 연동',
    path: '/doc/guide/ai-integration',
    icon: 'mdi-robot',
  },
  // ... 나머지 메뉴
]
```

### 템플릿 직접 작성 방식

```html
<!-- 기존: 연동준비 메뉴 -->
<router-link to="/doc/guide/integration-prepare" class="menu-item">
  연동준비
</router-link>

<!-- 추가: AI 연동 메뉴 -->
<router-link to="/doc/guide/ai-integration" class="menu-item">
  AI 연동
</router-link>
```

---

## 5. 페이지 타이틀 설정 (선택)

```javascript
router.afterEach((to) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title
  }
})
```

---

## 6. 확인 사항

적용 후 다음 사항을 확인하세요.

1. `/doc/guide/ai-integration` 경로로 접근 가능한지 확인
2. 좌측 메뉴에서 "AI 연동" 메뉴가 표시되는지 확인
3. 메뉴 클릭 시 페이지가 정상 렌더링되는지 확인
4. 코드 복사 버튼이 정상 동작하는지 확인
5. 도구별 탭 전환이 정상 동작하는지 확인 (MCP 설정 6개 탭, Skill 설정 4개 탭)
6. **다운로드 버튼**이 정상 동작하는지 확인 (IDE별 샘플 파일)
7. FAQ 아코디언이 정상 동작하는지 확인
8. 모바일 반응형 레이아웃이 정상 표시되는지 확인

---

## 7. 기존 버전 대비 변경사항

| 항목 | 기존 (v1) | 리뉴얼 (v2) |
|------|-----------|-------------|
| MCP 도구 | 4개 | **6개** (NEZO 전용 2개 추가) |
| 서비스 범위 | MOBILPAY만 | **MOBILPAY + NEZO** |
| 지원 IDE | 5개 | **6개** (Kiro 추가) |
| Skill 설정 | 일반적 안내 | **IDE별 상세 가이드** (Cursor .mdc, Kiro steering, Copilot instructions, Claude Code 네이티브) |
| 샘플 파일 | 없음 | **IDE별 다운로드** 제공 (8개 파일) |
| 보안 규칙 | MOBILPAY 5개 | **MOBILPAY 5개 + NEZO 7개** |
| FAQ | 6개 | **8개** |

---

## 8. 커스터마이징 참고

### 스타일 조정

`McpIntegrationGuide.vue`의 `<style scoped>` 섹션에서 개발자사이트의 기존 디자인 시스템에 맞게 색상, 폰트, 간격 등을 조정하세요.

- 주요 색상: `#1e40af` (파란색 계열) -> 사이트 브랜드 색상으로 변경
- 코드 블록 배경: `#1e293b` -> 사이트 다크 테마 색상으로 변경
- 폰트: `-apple-system, BlinkMacSystemFont...` -> 사이트 기본 폰트로 변경

### 다운로드 경로 수정

실제 서빙 환경에 맞게 `downloadBase` 변수를 수정하세요:

```javascript
// 개발 환경
downloadBase: '/downloads',

// 운영 환경
downloadBase: 'https://www.mobilians.co.kr/doc/downloads',
```

### 패키지 버전 고정

베타 테스트 기간에는 특정 버전을 명시하는 것이 안전합니다:

```
@mobilpay/mcp-server@latest  →  @mobilpay/mcp-server@2.0.0
```
