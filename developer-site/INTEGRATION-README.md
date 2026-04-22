# AI 연동 페이지 적용 가이드

개발자사이트(Vue.js)에 "AI 연동" 메뉴를 추가하기 위한 가이드입니다. 이 페이지는 MCP 서버와 Agent Skill 설정 방법, 동시 사용 가이드를 포함합니다.

---

## 1. 파일 배치

`AiIntegrationGuide.vue` 파일을 개발자사이트 프로젝트의 페이지 디렉토리에 복사합니다.

```
src/
├── views/           (또는 pages/)
│   ├── ...기존 페이지들
│   └── AiIntegrationGuide.vue   ← 여기에 추가
```

> 프로젝트 구조에 따라 `src/views/`, `src/pages/`, 또는 `src/components/pages/` 등 적절한 위치에 배치하세요.

---

## 2. 라우터 설정

`src/router/index.js` (또는 `router.js`)에 라우트를 추가합니다.

### Vue Router 3.x (Vue 2)

```javascript
// src/router/index.js
import AiIntegrationGuide from '@/views/AiIntegrationGuide.vue'

const routes = [
  // ... 기존 라우트들

  // "연동준비" 라우트 바로 다음에 추가
  {
    path: '/doc/guide/ai-integration',
    name: 'AiIntegration',
    component: AiIntegrationGuide,
    meta: {
      title: 'AI 연동 | MOBILPAY 개발자센터'
    }
  },

  // ... 나머지 라우트들
]
```

### Vue Router 4.x (Vue 3)

```javascript
// src/router/index.js
const routes = [
  // ... 기존 라우트들

  {
    path: '/doc/guide/ai-integration',
    name: 'AiIntegration',
    component: () => import('@/views/AiIntegrationGuide.vue'),  // lazy loading
    meta: {
      title: 'AI 연동 | MOBILPAY 개발자센터'
    }
  },
]
```

---

## 3. 좌측 메뉴에 추가

사이드바 메뉴 컴포넌트에서 "연동준비" 항목 바로 아래에 "AI 연동" 메뉴를 추가합니다.

### 방법 A: 메뉴 데이터가 배열로 관리되는 경우

메뉴 데이터 배열(예: `menuItems`, `sidebarMenu`, `navList` 등)에서 "연동준비" 항목을 찾아 그 바로 뒤에 추가합니다.

```javascript
// 메뉴 데이터 예시
const menuItems = [
  // ... 기존 메뉴
  {
    name: '연동준비',
    path: '/doc/guide/integration-prepare',  // 기존 경로
    // ...
  },
  // ↓↓↓ 이 항목을 "연동준비" 바로 다음에 추가 ↓↓↓
  {
    name: 'AI 연동',
    path: '/doc/guide/ai-integration',
    icon: 'mdi-robot',         // 아이콘은 프로젝트 아이콘 체계에 맞게 조정
    badge: 'Beta',             // 베타 표시 (선택사항)
  },
  // ... 나머지 메뉴
]
```

### 방법 B: 메뉴가 템플릿에 직접 작성된 경우

사이드바 컴포넌트(예: `Sidebar.vue`, `SideNav.vue`, `LeftMenu.vue` 등)의 템플릿에서 "연동준비" 메뉴 항목 바로 아래에 추가합니다.

```html
<!-- 기존: 연동준비 메뉴 -->
<router-link to="/doc/guide/integration-prepare" class="menu-item">
  연동준비
</router-link>

<!-- 추가: AI 연동 메뉴 -->
<router-link to="/doc/guide/ai-integration" class="menu-item">
  AI 연동
  <span class="badge-beta">Beta</span>
</router-link>
```

Beta 뱃지 스타일 (필요 시):

```css
.badge-beta {
  display: inline-block;
  background: #3b82f6;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  margin-left: 6px;
  vertical-align: middle;
}
```

---

## 4. 페이지 타이틀 설정 (선택)

라우터 가드에서 `meta.title`을 활용하여 브라우저 탭 제목을 변경할 수 있습니다.

```javascript
// src/router/index.js
router.afterEach((to) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title
  }
})
```

---

## 5. Skill 파일 호스팅

개발자사이트에서 Skill 파일을 다운로드할 수 있도록 정적 파일을 배치합니다.

```
public/ (또는 static/)
├── downloads/
│   ├── mobilpay-integration.skill    ← .skill 패키지 파일
│   └── SKILL.md                      ← SKILL.md 단독 파일 (Cursor/Windsurf용)
```

Vue 페이지에서 참조하는 다운로드 URL:
- `https://www.mobilians.co.kr/doc/downloads/mobilpay-integration.skill`
- `https://www.mobilians.co.kr/doc/downloads/SKILL.md`

---

## 6. 확인 사항

적용 후 다음 사항을 확인하세요.

1. `https://www.mobilians.co.kr/doc/guide/ai-integration` 경로로 접근 가능한지 확인
2. 좌측 메뉴에서 "연동준비" 아래에 "AI 연동" 메뉴가 표시되는지 확인
3. 메뉴 클릭 시 페이지가 정상 렌더링되는지 확인
4. 코드 복사 버튼이 정상 동작하는지 확인
5. 도구별 탭 전환이 정상 동작하는지 확인
6. FAQ 아코디언이 정상 동작하는지 확인
7. 모바일 반응형 레이아웃이 정상 표시되는지 확인

---

## 6. 커스터마이징 참고

### 스타일 조정

`AiIntegrationGuide.vue`의 `<style scoped>` 섹션에서 개발자사이트의 기존 디자인 시스템에 맞게 색상, 폰트, 간격 등을 조정하세요. 주요 변수:

- 주요 색상: `#1e40af` (파란색 계열) → 사이트 브랜드 색상으로 변경
- 코드 블록 배경: `#1e293b` → 사이트 다크 테마 색상으로 변경
- 폰트: `-apple-system, BlinkMacSystemFont...` → 사이트 기본 폰트로 변경

### llms.txt URL 수정

실제 `llms.txt` 파일을 서빙할 URL이 확정되면, 컴포넌트 내 URL을 업데이트하세요.

### 패키지 버전 고정

베타 테스트 기간에는 특정 버전을 명시하는 것이 안전합니다:

```
@mobilpay/mcp-server@latest  →  @mobilpay/mcp-server@1.1.0
```
