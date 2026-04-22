<template>
  <div class="guide-container">
    <!-- 페이지 헤더 -->
    <div class="guide-header">
      <h1>AI 연동</h1>
      <p class="guide-subtitle">MCP + Skills로 결제 연동하기</p>
      <p class="guide-desc">
        MOBILPAY는 AI 코딩 도구에서 결제 연동을 빠르고 정확하게 수행할 수 있도록
        <strong>MCP 서버</strong>와 <strong>Agent Skill</strong> 두 가지를 제공합니다.
        각각 독립적으로 사용할 수도 있고, 함께 사용하면 최대 효과를 얻을 수 있습니다.
      </p>
    </div>

    <!-- MCP vs Skills 비교 -->
    <section class="guide-section">
      <h2 id="overview">MCP와 Skills 한눈에 보기</h2>
      <p>두 가지 모두 AI가 MOBILPAY 결제 연동을 돕는 도구이지만 역할이 다릅니다.</p>
      <div class="compare-cards">
        <div class="compare-card mcp-card">
          <div class="compare-badge">MCP Server</div>
          <div class="compare-role">데이터 계층</div>
          <p>AI가 결제 연동 문서를 <strong>실시간 검색</strong>하고 API 명세, 코드 예제를 조회하는 도구입니다.</p>
          <ul class="compare-features">
            <li>키워드 기반 문서 검색 (BM25)</li>
            <li>API 전체 명세 조회</li>
            <li>언어별 코드 예제 추출</li>
            <li>문서 ID로 전체 문서 열람</li>
          </ul>
          <div class="compare-analogy">비유: AI에게 결제 연동 문서 <strong>검색 엔진</strong>을 제공</div>
        </div>
        <div class="compare-card skill-card">
          <div class="compare-badge">Agent Skill</div>
          <div class="compare-role">지식 계층</div>
          <p>AI의 <strong>행동 자체를 가이드</strong>하는 프롬프트 기반 전문 지식입니다. 코드 생성 시 보안 규칙, 결제 플로우, 체크리스트를 자동 적용합니다.</p>
          <ul class="compare-features">
            <li>결제 플로우 자동 설계</li>
            <li>보안 규칙 5가지 자동 적용</li>
            <li>코드 생성 후 체크리스트 검증</li>
            <li>결제수단별 옵션 가이드</li>
          </ul>
          <div class="compare-analogy">비유: AI에게 결제 연동 <strong>전문가 지식</strong>을 내장</div>
        </div>
      </div>
      <div class="info-box" style="margin-top: 20px;">
        <div class="info-icon">💡</div>
        <div class="info-content">
          <strong>함께 사용하면?</strong>
          MCP가 정확한 API 명세를 조회하고, Skill이 보안 규칙과 베스트 프랙티스를 자동 적용합니다.
          테스트 결과 함께 사용 시 코드 정확도가 <strong>100%</strong>로, Skill 미적용 대비 <strong>+43%</strong> 향상되었습니다.
        </div>
      </div>
    </section>

    <!-- MCP란? -->
    <section class="guide-section">
      <h2 id="what-is-mcp">MCP란?</h2>
      <p>
        MCP(Model Context Protocol)는 Anthropic이 정의한 개방형 표준으로,
        AI 모델이 외부 데이터 소스와 도구에 안전하게 접근할 수 있도록 해주는 프로토콜입니다.
      </p>
      <p>
        MOBILPAY MCP 서버는 <strong>18개의 결제 연동 문서</strong>(API 레퍼런스, 연동 가이드, 코드표)를
        인덱싱하여 AI 모델에 제공합니다. 이를 통해 AI가 MOBILPAY 결제 연동에 필요한 정확한 정보를
        기반으로 코드를 생성하고, 연동 질문에 답변할 수 있습니다.
      </p>
      <div class="info-box">
        <div class="info-icon">💡</div>
        <div class="info-content">
          <strong>npm 패키지:</strong>
          <code>@mobilpay/mcp-server</code> — 별도 설치 없이 <code>npx</code>로 바로 실행 가능합니다.
        </div>
      </div>
    </section>

    <!-- 지원 도구 -->
    <section class="guide-section">
      <h2 id="supported-tools">지원 도구</h2>
      <p>다음 AI 코딩 도구에서 MOBILPAY MCP 서버를 사용할 수 있습니다.</p>
      <div class="tool-grid">
        <div class="tool-card" v-for="tool in supportedTools" :key="tool.name">
          <div class="tool-name">{{ tool.name }}</div>
          <div class="tool-desc">{{ tool.desc }}</div>
        </div>
      </div>
    </section>

    <!-- 설치 및 설정 -->
    <section class="guide-section">
      <h2 id="setup">설치 및 설정</h2>
      <div class="prereq-box">
        <strong>사전 요구사항:</strong> Node.js 18 이상이 설치되어 있어야 합니다.
      </div>

      <!-- 도구별 탭 -->
      <div class="setup-tabs">
        <button
          v-for="tab in setupTabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Cursor -->
      <div v-show="activeTab === 'cursor'" class="tab-content">
        <h3>Cursor 설정</h3>
        <p><strong>방법 1: 프로젝트 단위 설정</strong></p>
        <p>프로젝트 루트에 <code>.cursor/mcp.json</code> 파일을 생성합니다.</p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">.cursor/mcp.json</span>
            <button class="copy-btn" @click="copyCode('cursor')">{{ copiedId === 'cursor' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.cursor }}</code></pre>
        </div>
        <p><strong>방법 2: 글로벌 설정</strong></p>
        <p><code>~/.cursor/mcp.json</code> 파일에 위 내용을 추가하면 모든 프로젝트에서 사용할 수 있습니다.</p>
      </div>

      <!-- Windsurf -->
      <div v-show="activeTab === 'windsurf'" class="tab-content">
        <h3>Windsurf 설정</h3>
        <p><code>~/.codeium/windsurf/mcp_config.json</code> 파일을 열고 다음을 추가합니다.</p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">mcp_config.json</span>
            <button class="copy-btn" @click="copyCode('windsurf')">{{ copiedId === 'windsurf' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.windsurf }}</code></pre>
        </div>
      </div>

      <!-- Claude Desktop -->
      <div v-show="activeTab === 'claude'" class="tab-content">
        <h3>Claude Desktop 설정</h3>
        <p>Claude Desktop 앱의 설정 파일에 MCP 서버를 추가합니다.</p>
        <div class="path-list">
          <div class="path-item">
            <span class="os-badge">macOS</span>
            <code>~/Library/Application Support/Claude/claude_desktop_config.json</code>
          </div>
          <div class="path-item">
            <span class="os-badge">Windows</span>
            <code>%APPDATA%\Claude\claude_desktop_config.json</code>
          </div>
        </div>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">claude_desktop_config.json</span>
            <button class="copy-btn" @click="copyCode('claude')">{{ copiedId === 'claude' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.claude }}</code></pre>
        </div>
      </div>

      <!-- VS Code -->
      <div v-show="activeTab === 'vscode'" class="tab-content">
        <h3>VS Code (GitHub Copilot) 설정</h3>
        <p>VS Code의 설정(<code>settings.json</code>)에 다음을 추가합니다.</p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">settings.json</span>
            <button class="copy-btn" @click="copyCode('vscode')">{{ copiedId === 'vscode' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.vscode }}</code></pre>
        </div>
        <p>또는 프로젝트 루트에 <code>.vscode/mcp.json</code> 파일을 생성합니다.</p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">.vscode/mcp.json</span>
            <button class="copy-btn" @click="copyCode('vscode-project')">{{ copiedId === 'vscode-project' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.vscodeProject }}</code></pre>
        </div>
      </div>

      <!-- Claude Code -->
      <div v-show="activeTab === 'claude-code'" class="tab-content">
        <h3>Claude Code 설정</h3>
        <p>터미널에서 다음 명령어를 실행합니다.</p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">Terminal</span>
            <button class="copy-btn" @click="copyCode('claude-code')">{{ copiedId === 'claude-code' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.claudeCode }}</code></pre>
        </div>
      </div>
    </section>

    <!-- 제공 도구 -->
    <section class="guide-section">
      <h2 id="mcp-tools">제공 도구 (MCP Tools)</h2>
      <p>MOBILPAY MCP 서버는 4개의 도구를 제공합니다.</p>

      <div class="tool-detail" v-for="tool in mcpTools" :key="tool.name">
        <h3>
          <code>{{ tool.name }}</code>
        </h3>
        <p>{{ tool.description }}</p>
        <table class="param-table">
          <thead>
            <tr>
              <th>파라미터</th>
              <th>타입</th>
              <th>필수</th>
              <th>설명</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="param in tool.params" :key="param.name">
              <td><code>{{ param.name }}</code></td>
              <td><code>{{ param.type }}</code></td>
              <td>{{ param.required ? '예' : '아니오' }}</td>
              <td>{{ param.desc }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="tool.apiNames" class="api-name-list">
          <p><strong>사용 가능한 api_name:</strong></p>
          <div class="api-name-grid">
            <div class="api-name-item" v-for="api in tool.apiNames" :key="api.name">
              <code>{{ api.name }}</code>
              <span>{{ api.desc }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- llms.txt -->
    <section class="guide-section">
      <h2 id="llms-txt">llms.txt</h2>
      <p>
        AI 모델이 직접 참조할 수 있는 문서 인덱스 파일도 제공합니다.
        <a href="https://llmstxt.org" target="_blank" rel="noopener">llms.txt 표준</a>을
        지원하는 AI 도구에서 직접 활용할 수 있습니다.
      </p>
      <div class="code-block">
        <div class="code-header">
          <span class="code-lang">URL</span>
          <button class="copy-btn" @click="copyCode('llms-txt')">{{ copiedId === 'llms-txt' ? '복사됨!' : '복사' }}</button>
        </div>
        <pre><code>https://www.mobilians.co.kr/doc/llms.txt</code></pre>
      </div>
    </section>

    <!-- 사용 예시 -->
    <section class="guide-section">
      <h2 id="examples">사용 예시</h2>
      <p>MCP 서버를 설정한 후, AI 코딩 도구에서 자연어로 질문하면 됩니다.</p>
      <div class="example-list">
        <div class="example-item" v-for="example in usageExamples" :key="example.title">
          <div class="example-title">{{ example.title }}</div>
          <div class="example-prompt">{{ example.prompt }}</div>
        </div>
      </div>
    </section>

    <!-- Agent Skill -->
    <section class="guide-section">
      <h2 id="skill">Agent Skill</h2>
      <p>
        Agent Skill은 AI의 행동을 가이드하는 도메인 전문 지식 패키지입니다.
        MCP가 문서를 검색해주는 "검색 엔진"이라면, Skill은 AI가 코드를 작성할 때
        보안 규칙과 결제 플로우를 자동으로 적용하게 해주는 "전문가 매뉴얼"입니다.
      </p>

      <h3>Skill이란?</h3>
      <p>
        Anthropic이 공개한 개방형 표준으로, <code>SKILL.md</code> 파일 하나에
        AI가 특정 도메인 작업을 수행할 때 따라야 할 규칙, 절차, 참고 문서를 정의합니다.
        AI 코딩 도구가 이 파일을 읽으면 해당 분야의 전문가처럼 행동합니다.
      </p>

      <h3>MOBILPAY Skill이 제공하는 것</h3>
      <table class="param-table">
        <thead>
          <tr>
            <th>기능</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="feat in skillFeatures" :key="feat.name">
            <td><strong>{{ feat.name }}</strong></td>
            <td>{{ feat.desc }}</td>
          </tr>
        </tbody>
      </table>

      <h3>Skill 설치 방법</h3>
      <div class="setup-tabs">
        <button
          v-for="tab in skillSetupTabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeSkillTab === tab.id }]"
          @click="activeSkillTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Claude Code Skill -->
      <div v-show="activeSkillTab === 'claude-code-skill'" class="tab-content">
        <h3>Claude Code</h3>
        <p><strong>방법 1: .skill 파일로 설치</strong></p>
        <p>
          <a href="https://www.mobilians.co.kr/doc/downloads/mobilpay-integration.skill" target="_blank">
            mobilpay-integration.skill 다운로드
          </a> 후, 프로젝트 디렉토리에서 설치합니다.
        </p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">Terminal</span>
            <button class="copy-btn" @click="copyCode('skill-install-file')">{{ copiedId === 'skill-install-file' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.skillInstallFile }}</code></pre>
        </div>
        <p><strong>방법 2: 디렉토리 직접 배치</strong></p>
        <p>
          프로젝트 루트의 <code>.claude/skills/</code> 하위에 <code>mobilpay-integration/</code> 디렉토리를 복사합니다.
        </p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">프로젝트 구조</span>
          </div>
          <pre><code>{{ codeSnippets.skillDirStructure }}</code></pre>
        </div>
      </div>

      <!-- Cursor Skill -->
      <div v-show="activeSkillTab === 'cursor-skill'" class="tab-content">
        <h3>Cursor</h3>
        <p>
          프로젝트 루트에 <code>.cursorrules</code> 파일을 생성하고,
          MOBILPAY Skill의 SKILL.md 내용을 붙여넣습니다.
        </p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">.cursorrules</span>
            <button class="copy-btn" @click="copyCode('skill-cursorrules')">{{ copiedId === 'skill-cursorrules' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.skillCursorrules }}</code></pre>
        </div>
      </div>

      <!-- Windsurf Skill -->
      <div v-show="activeSkillTab === 'windsurf-skill'" class="tab-content">
        <h3>Windsurf</h3>
        <p>
          프로젝트 루트에 <code>.windsurfrules</code> 파일을 생성하고,
          MOBILPAY Skill의 SKILL.md 내용을 붙여넣습니다.
        </p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">.windsurfrules</span>
            <button class="copy-btn" @click="copyCode('skill-windsurfrules')">{{ copiedId === 'skill-windsurfrules' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.skillWindsurfrules }}</code></pre>
        </div>
      </div>

      <!-- Claude Desktop Skill -->
      <div v-show="activeSkillTab === 'claude-desktop-skill'" class="tab-content">
        <h3>Claude Desktop (Cowork)</h3>
        <p>
          Claude Desktop의 Cowork 모드에서 <code>.skill</code> 파일을 직접 설치할 수 있습니다.
        </p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">설치 방법</span>
          </div>
          <pre><code>{{ codeSnippets.skillClaudeDesktop }}</code></pre>
        </div>
      </div>
    </section>

    <!-- MCP + Skill 동시 사용 -->
    <section class="guide-section">
      <h2 id="mcp-skill-together">MCP + Skill 함께 사용하기</h2>
      <p>
        MCP와 Skill을 함께 설정하면 AI가 두 가지를 동시에 활용하여
        가장 정확한 연동 코드를 생성합니다.
      </p>

      <h3>동작 방식</h3>
      <div class="flow-diagram">
        <div class="flow-step">
          <div class="flow-number">1</div>
          <div class="flow-content">
            <strong>사용자가 질문</strong>
            <span>"MOBILPAY 카카오페이 연동 코드 작성해줘"</span>
          </div>
        </div>
        <div class="flow-arrow">→</div>
        <div class="flow-step">
          <div class="flow-number">2</div>
          <div class="flow-content">
            <strong>Skill 적용</strong>
            <span>결제 플로우, 보안 규칙, 체크리스트 자동 로드</span>
          </div>
        </div>
        <div class="flow-arrow">→</div>
        <div class="flow-step">
          <div class="flow-number">3</div>
          <div class="flow-content">
            <strong>MCP 검색</strong>
            <span>거래등록 API 명세, 간편결제 파라미터 조회</span>
          </div>
        </div>
        <div class="flow-arrow">→</div>
        <div class="flow-step">
          <div class="flow-number">4</div>
          <div class="flow-content">
            <strong>코드 생성</strong>
            <span>정확한 파라미터 + 보안 규칙이 모두 적용된 코드</span>
          </div>
        </div>
      </div>

      <h3>도구별 동시 설정 방법</h3>
      <div class="setup-tabs">
        <button
          v-for="tab in comboTabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeComboTab === tab.id }]"
          @click="activeComboTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-show="activeComboTab === 'combo-cursor'" class="tab-content">
        <h3>Cursor: MCP + Skill 동시 설정</h3>
        <p><strong>Step 1.</strong> MCP 설정 — <code>.cursor/mcp.json</code></p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">.cursor/mcp.json</span>
            <button class="copy-btn" @click="copyCode('cursor')">{{ copiedId === 'cursor' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.cursor }}</code></pre>
        </div>
        <p><strong>Step 2.</strong> Skill 설정 — <code>.cursorrules</code>에 SKILL.md 내용 붙여넣기</p>
        <p>두 파일을 모두 프로젝트에 배치하면 Cursor가 자동으로 인식합니다.</p>
      </div>

      <div v-show="activeComboTab === 'combo-claude-code'" class="tab-content">
        <h3>Claude Code: MCP + Skill 동시 설정</h3>
        <p>터미널에서 두 명령어를 순서대로 실행합니다.</p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">Terminal</span>
            <button class="copy-btn" @click="copyCode('combo-claude-code')">{{ copiedId === 'combo-claude-code' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.comboClaudeCode }}</code></pre>
        </div>
      </div>

      <div v-show="activeComboTab === 'combo-windsurf'" class="tab-content">
        <h3>Windsurf: MCP + Skill 동시 설정</h3>
        <p><strong>Step 1.</strong> MCP 설정 — <code>~/.codeium/windsurf/mcp_config.json</code></p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">mcp_config.json</span>
            <button class="copy-btn" @click="copyCode('windsurf')">{{ copiedId === 'windsurf' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.windsurf }}</code></pre>
        </div>
        <p><strong>Step 2.</strong> Skill 설정 — 프로젝트 루트에 <code>.windsurfrules</code> 파일 생성 후 SKILL.md 내용 붙여넣기</p>
      </div>

      <div v-show="activeComboTab === 'combo-claude-desktop'" class="tab-content">
        <h3>Claude Desktop: MCP + Skill 동시 설정</h3>
        <p><strong>Step 1.</strong> MCP 설정 — <code>claude_desktop_config.json</code></p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">claude_desktop_config.json</span>
            <button class="copy-btn" @click="copyCode('claude')">{{ copiedId === 'claude' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.claude }}</code></pre>
        </div>
        <p><strong>Step 2.</strong> Skill 설정 — Cowork 모드에서 <code>.skill</code> 파일 설치</p>
      </div>

      <h3>벤치마크 결과</h3>
      <p>3개 테스트 케이스에 대한 코드 정확도 측정 결과입니다.</p>
      <table class="param-table">
        <thead>
          <tr>
            <th>구성</th>
            <th>정확도</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>MCP + Skill</strong></td>
            <td><span class="badge-pass">100%</span></td>
            <td>보안 규칙, 파라미터, 응답 포맷 모두 정확</td>
          </tr>
          <tr>
            <td>MCP만 사용</td>
            <td><span class="badge-partial">57%</span></td>
            <td>API 명세는 정확하나 보안 규칙 누락 발생</td>
          </tr>
          <tr>
            <td>AI 기본 지식만</td>
            <td><span class="badge-fail">~30%</span></td>
            <td>파라미터명 오류, 보안 규칙 미적용</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 보안 규칙 -->
    <section class="guide-section">
      <h2 id="security">보안 규칙</h2>
      <p>MCP 서버는 AI 모델이 코드를 생성할 때 다음 보안 규칙을 준수하도록 안내합니다.</p>
      <table class="security-table">
        <thead>
          <tr>
            <th>규칙</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rule in securityRules" :key="rule.name">
            <td><strong>{{ rule.name }}</strong></td>
            <td>{{ rule.desc }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- FAQ -->
    <section class="guide-section">
      <h2 id="faq">FAQ</h2>
      <div class="faq-list">
        <div
          class="faq-item"
          v-for="(faq, index) in faqs"
          :key="index"
          :class="{ open: openFaq === index }"
        >
          <div class="faq-question" @click="toggleFaq(index)">
            <span>{{ faq.q }}</span>
            <span class="faq-toggle">{{ openFaq === index ? '−' : '+' }}</span>
          </div>
          <div class="faq-answer" v-show="openFaq === index">
            <p>{{ faq.a }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 기술지원 -->
    <section class="guide-section">
      <h2 id="support">기술지원</h2>
      <p>MCP 서버 사용 중 문제가 발생하면 아래로 문의해 주세요.</p>
      <table class="support-table">
        <thead>
          <tr>
            <th>구분</th>
            <th>연락처</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>기술지원/모듈연동</td>
            <td>TEL 02-2192-2059 / <a href="mailto:svcop@kggroup.co.kr">svcop@kggroup.co.kr</a></td>
          </tr>
          <tr>
            <td>일반 고객 문의</td>
            <td>TEL 1800-0678 / <a href="mailto:help@kggroup.co.kr">help@kggroup.co.kr</a></td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
export default {
  name: 'McpIntegrationGuide',

  data() {
    return {
      activeTab: 'cursor',
      activeSkillTab: 'claude-code-skill',
      activeComboTab: 'combo-cursor',
      copiedId: null,
      openFaq: null,

      supportedTools: [
        { name: 'Cursor', desc: 'AI 기반 코드 에디터' },
        { name: 'Windsurf', desc: 'AI 코딩 어시스턴트' },
        { name: 'Claude Desktop', desc: 'Anthropic의 Claude 데스크톱 앱' },
        { name: 'VS Code (Copilot)', desc: 'GitHub Copilot MCP 확장' },
        { name: 'Claude Code', desc: 'CLI 기반 AI 코딩 에이전트' },
      ],

      setupTabs: [
        { id: 'cursor', label: 'Cursor' },
        { id: 'windsurf', label: 'Windsurf' },
        { id: 'claude', label: 'Claude Desktop' },
        { id: 'vscode', label: 'VS Code' },
        { id: 'claude-code', label: 'Claude Code' },
      ],

      codeSnippets: {
        cursor: JSON.stringify({
          mcpServers: {
            mobilpay: {
              command: 'npx',
              args: ['-y', '@mobilpay/mcp-server@latest'],
            },
          },
        }, null, 2),
        windsurf: JSON.stringify({
          mcpServers: {
            mobilpay: {
              command: 'npx',
              args: ['-y', '@mobilpay/mcp-server@latest'],
            },
          },
        }, null, 2),
        claude: JSON.stringify({
          mcpServers: {
            mobilpay: {
              command: 'npx',
              args: ['-y', '@mobilpay/mcp-server@latest'],
            },
          },
        }, null, 2),
        vscode: JSON.stringify({
          mcp: {
            servers: {
              mobilpay: {
                command: 'npx',
                args: ['-y', '@mobilpay/mcp-server@latest'],
              },
            },
          },
        }, null, 2),
        vscodeProject: JSON.stringify({
          servers: {
            mobilpay: {
              command: 'npx',
              args: ['-y', '@mobilpay/mcp-server@latest'],
            },
          },
        }, null, 2),
        claudeCode: 'claude mcp add mobilpay -- npx -y @mobilpay/mcp-server@latest',
        skillInstallFile: '# .skill 파일 다운로드 후 프로젝트 디렉토리에서 실행\nclaude skill install mobilpay-integration.skill',
        skillDirStructure: 'my-project/\n├── .claude/\n│   └── skills/\n│       └── mobilpay-integration/\n│           ├── SKILL.md\n│           └── references/\n│               ├── api/         (11 파일)\n│               ├── guides/      (5 파일)\n│               └── reference/   (2 파일)\n├── src/\n└── ...',
        skillCursorrules: '# .cursorrules 파일에 아래 내용을 붙여넣으세요.\n# MOBILPAY SKILL.md 전체 내용을 복사합니다.\n# 다운로드: https://www.mobilians.co.kr/doc/downloads/SKILL.md',
        skillWindsurfrules: '# .windsurfrules 파일에 아래 내용을 붙여넣으세요.\n# MOBILPAY SKILL.md 전체 내용을 복사합니다.\n# 다운로드: https://www.mobilians.co.kr/doc/downloads/SKILL.md',
        skillClaudeDesktop: '1. mobilpay-integration.skill 파일을 다운로드합니다.\n2. Claude Desktop의 Cowork 모드를 실행합니다.\n3. "이 skill을 설치해줘"라고 요청하고 파일을 첨부합니다.\n4. 설치 완료 후 MOBILPAY 관련 질문을 하면 자동으로 Skill이 적용됩니다.',
        comboClaudeCode: '# Step 1: MCP 서버 추가\nclaude mcp add mobilpay -- npx -y @mobilpay/mcp-server@latest\n\n# Step 2: Skill 설치\nclaude skill install mobilpay-integration.skill\n\n# 이제 claude 실행 시 MCP + Skill이 동시에 활성화됩니다.',
      },

      skillSetupTabs: [
        { id: 'claude-code-skill', label: 'Claude Code' },
        { id: 'cursor-skill', label: 'Cursor' },
        { id: 'windsurf-skill', label: 'Windsurf' },
        { id: 'claude-desktop-skill', label: 'Claude Desktop' },
      ],

      comboTabs: [
        { id: 'combo-cursor', label: 'Cursor' },
        { id: 'combo-claude-code', label: 'Claude Code' },
        { id: 'combo-windsurf', label: 'Windsurf' },
        { id: 'combo-claude-desktop', label: 'Claude Desktop' },
      ],

      skillFeatures: [
        { name: '결제 플로우 자동 설계', desc: '일반결제/하이브리드결제 플로우를 자동으로 파악하고 전체 구현 단계를 가이드합니다.' },
        { name: '보안 규칙 5가지 자동 적용', desc: 'skey 환경변수 로드, HMAC 서버사이드, noti_url 멱등성, 결제승인 백엔드, 호스트 분기를 모든 코드에 자동 적용합니다.' },
        { name: '코드 생성 후 체크리스트', desc: '코드 작성 후 8가지 항목(금액 검증, 중복 방어, SUCCESS 출력 등)을 자동 검증합니다.' },
        { name: '결제수단별 옵션 가이드', desc: '휴대폰/신용카드/계좌이체/가상계좌/간편결제별 올바른 파라미터 접두어와 필수값을 안내합니다.' },
        { name: '18개 참조 문서 번들링', desc: 'API 레퍼런스 11개, 연동 가이드 5개, 코드표/에러코드 2개가 Skill에 내장되어 있습니다.' },
      ],

      mcpTools: [
        {
          name: 'get-mobilpay-docs',
          description: '키워드 기반으로 MOBILPAY 결제 연동 문서를 검색합니다. BM25 알고리즘을 사용하여 가장 관련성 높은 문서 청크를 반환합니다.',
          params: [
            { name: 'keywords', type: 'string[]', required: true, desc: '검색 키워드 배열. 예: ["거래등록", "sid"]' },
          ],
        },
        {
          name: 'get-api-spec',
          description: '특정 MOBILPAY API의 전체 명세를 조회합니다. 요청/응답 파라미터와 예제 코드를 포함한 전체 문서를 반환합니다.',
          params: [
            { name: 'api_name', type: 'string', required: true, desc: 'API 이름. 예: registration, cancel, hmac' },
          ],
          apiNames: [
            { name: 'registration', desc: '거래등록 API' },
            { name: 'payment-window', desc: '결제창 호출' },
            { name: 'auth-response', desc: '인증/승인 응답' },
            { name: 'approval-tid', desc: '결제승인 (TID 방식)' },
            { name: 'approval-mobilid', desc: '결제승인 (MOBILID 방식)' },
            { name: 'purchase', desc: '수동매입' },
            { name: 'virtual-account', desc: '가상계좌' },
            { name: 'cancel', desc: '결제취소' },
            { name: 'refund', desc: '환불' },
            { name: 'cash-receipt', desc: '현금영수증' },
            { name: 'hmac', desc: 'HMAC 무결성 검증' },
          ],
        },
        {
          name: 'document-by-id',
          description: '문서 ID로 전체 문서를 조회합니다. get-mobilpay-docs 검색 결과에서 특정 문서의 전체 내용이 필요할 때 사용합니다.',
          params: [
            { name: 'id', type: 'number', required: true, desc: '문서 ID. 0을 입력하면 전체 문서 목록을 반환합니다.' },
          ],
        },
        {
          name: 'get-code-example',
          description: 'API별 언어별 예제 코드를 조회합니다. HMAC 검증 문서에는 Java, C#, Node.js, Python, PHP 예제가 포함되어 있습니다.',
          params: [
            { name: 'api_name', type: 'string', required: true, desc: 'API 이름. 예: hmac, registration' },
            { name: 'language', type: 'string', required: false, desc: '프로그래밍 언어 필터. java, python, node, php, csharp' },
          ],
        },
      ],

      usageExamples: [
        {
          title: '결제 연동 시작하기',
          prompt: 'MOBILPAY 신용카드 결제 연동을 시작하려고 합니다. 거래등록부터 결제 완료까지 전체 플로우를 알려주세요.',
        },
        {
          title: '특정 API 코드 생성',
          prompt: 'MOBILPAY 거래등록 API를 Node.js로 호출하는 코드를 작성해주세요. 신용카드 결제로 10,000원을 결제합니다.',
        },
        {
          title: '에러 해결',
          prompt: 'MOBILPAY 결제 연동 중 에러코드 M110이 발생했습니다. 원인과 해결 방법을 알려주세요.',
        },
        {
          title: 'HMAC 검증 구현',
          prompt: 'MOBILPAY HMAC 무결성 검증 코드를 Python으로 작성해주세요.',
        },
        {
          title: 'noti_url 구현',
          prompt: '결제 완료 후 noti_url로 결과를 수신하는 서버 코드를 작성해주세요. 중복 호출 방어 로직도 포함해주세요.',
        },
      ],

      securityRules: [
        { name: 'skey 보호', desc: 'skey(서비스 키)는 절대 클라이언트 코드에 포함하지 않습니다. 반드시 환경변수에서 로드합니다.' },
        { name: 'HMAC 서버사이드', desc: 'HMAC 무결성 검증은 반드시 서버에서만 수행합니다.' },
        { name: 'noti_url 멱등성', desc: 'noti_url 핸들러에는 tid 기반 중복 처리 방어 로직을 포함합니다.' },
        { name: '결제승인 백엔드', desc: '결제승인 API(/MUP/api/approval)는 반드시 백엔드에서만 호출합니다.' },
        { name: '호스트 구분', desc: '테스트: test.mobilians.co.kr / 운영: mup.mobilians.co.kr' },
      ],

      faqs: [
        {
          q: 'MCP와 Skill 중 무엇을 사용해야 하나요?',
          a: '둘 다 사용하는 것을 권장합니다. MCP는 정확한 API 명세를 조회하고, Skill은 보안 규칙과 베스트 프랙티스를 자동 적용합니다. 하나만 사용한다면 Skill만으로도 기본적인 연동이 가능하고, MCP만으로도 문서 검색 기반 코드 생성이 가능합니다.',
        },
        {
          q: 'MCP 서버를 직접 설치해야 하나요?',
          a: '아닙니다. npx 명령어를 통해 자동으로 다운로드 및 실행되므로 별도 설치가 필요 없습니다. 단, Node.js 18 이상이 필요합니다.',
        },
        {
          q: 'Skill은 어떤 AI 도구에서 사용할 수 있나요?',
          a: 'Claude Code, Cursor, Windsurf, Claude Desktop(Cowork)에서 사용할 수 있습니다. Cursor와 Windsurf는 .cursorrules/.windsurfrules 파일에 SKILL.md 내용을 붙여넣는 방식으로 적용합니다.',
        },
        {
          q: 'MCP 서버가 외부로 데이터를 전송하나요?',
          a: '아닙니다. MCP 서버와 Skill 모두 로컬에서 실행되며, 외부 서버로의 네트워크 요청은 발생하지 않습니다.',
        },
        {
          q: 'MCP 서버의 문서는 최신 상태인가요?',
          a: '@latest 태그를 사용하면 npm에 게시된 최신 버전의 문서를 항상 사용할 수 있습니다. 특정 버전을 고정하려면 @mobilpay/mcp-server@1.1.0과 같이 버전을 명시하세요.',
        },
        {
          q: '어떤 결제수단을 지원하나요?',
          a: '휴대폰(MC), 신용카드(CN), 실계좌이체(RA), 가상계좌(VA)를 지원합니다.',
        },
      ],
    };
  },

  methods: {
    copyCode(id) {
      const snippetMap = {
        'cursor': this.codeSnippets.cursor,
        'windsurf': this.codeSnippets.windsurf,
        'claude': this.codeSnippets.claude,
        'vscode': this.codeSnippets.vscode,
        'vscode-project': this.codeSnippets.vscodeProject,
        'claude-code': this.codeSnippets.claudeCode,
        'llms-txt': 'https://www.mobilians.co.kr/doc/llms.txt',
        'skill-install-file': this.codeSnippets.skillInstallFile,
        'skill-cursorrules': this.codeSnippets.skillCursorrules,
        'skill-windsurfrules': this.codeSnippets.skillWindsurfrules,
        'combo-claude-code': this.codeSnippets.comboClaudeCode,
      };
      const text = snippetMap[id];
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          this.copiedId = id;
          setTimeout(() => { this.copiedId = null; }, 2000);
        });
      }
    },

    toggleFaq(index) {
      this.openFaq = this.openFaq === index ? null : index;
    },
  },
};
</script>

<style scoped>
.guide-container {
  max-width: 840px;
  margin: 0 auto;
  padding: 40px 24px 80px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a1a2e;
  line-height: 1.7;
}

.guide-header {
  margin-bottom: 48px;
}

.guide-header h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px;
}

.guide-subtitle {
  font-size: 20px;
  color: #4a5568;
  margin: 0 0 16px;
}

.guide-desc {
  font-size: 16px;
  color: #636e7b;
  margin: 0;
}

.guide-section {
  margin-bottom: 48px;
}

.guide-section h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.guide-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 24px 0 12px;
}

.guide-section p {
  margin: 0 0 12px;
  font-size: 15px;
}

/* 코드 블록 */
code {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Fira Code', 'Consolas', monospace;
}

.code-block {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin: 12px 0 20px;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 8px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.code-lang {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.copy-btn {
  background: none;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 12px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #e2e8f0;
}

.code-block pre {
  margin: 0;
  padding: 16px;
  background: #1e293b;
  overflow-x: auto;
}

.code-block pre code {
  background: none;
  padding: 0;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.6;
}

/* 정보 박스 */
.info-box {
  display: flex;
  gap: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.info-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.info-content {
  font-size: 14px;
  color: #1e40af;
}

.prereq-box {
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 24px;
  font-size: 14px;
  color: #854d0e;
}

/* 도구 그리드 */
.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.tool-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s;
}

.tool-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tool-name {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 4px;
}

.tool-desc {
  font-size: 13px;
  color: #64748b;
}

/* 탭 */
.setup-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 0;
  overflow-x: auto;
}

.tab-btn {
  padding: 10px 20px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  white-space: nowrap;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #1e40af;
}

.tab-btn.active {
  color: #1e40af;
  border-bottom-color: #1e40af;
}

.tab-content {
  padding: 24px 0;
}

/* 경로 목록 */
.path-list {
  margin: 12px 0 20px;
}

.path-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 14px;
}

.os-badge {
  background: #e2e8f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  min-width: 64px;
  text-align: center;
}

/* 도구 상세 */
.tool-detail {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
}

.tool-detail h3 {
  margin-top: 0;
}

.param-table,
.security-table,
.support-table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 14px;
}

.param-table th,
.param-table td,
.security-table th,
.security-table td,
.support-table th,
.support-table td {
  border: 1px solid #e2e8f0;
  padding: 10px 14px;
  text-align: left;
}

.param-table th,
.security-table th,
.support-table th {
  background: #f8fafc;
  font-weight: 600;
  font-size: 13px;
  color: #475569;
}

/* API name 그리드 */
.api-name-list {
  margin-top: 16px;
}

.api-name-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.api-name-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 6px 10px;
  background: #f8fafc;
  border-radius: 4px;
}

.api-name-item code {
  font-weight: 600;
  min-width: 120px;
}

/* 사용 예시 */
.example-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.example-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
}

.example-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 8px;
  color: #1e40af;
}

.example-prompt {
  background: #f8fafc;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 14px;
  color: #334155;
  border-left: 3px solid #3b82f6;
}

/* FAQ */
.faq-list {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.faq-item {
  border-bottom: 1px solid #e2e8f0;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: background 0.2s;
}

.faq-question:hover {
  background: #f8fafc;
}

.faq-toggle {
  font-size: 20px;
  color: #94a3b8;
  flex-shrink: 0;
  margin-left: 16px;
}

.faq-answer {
  padding: 0 20px 16px;
  font-size: 14px;
  color: #475569;
}

.faq-answer p {
  margin: 0;
}

.faq-item.open .faq-question {
  background: #f8fafc;
}

/* 비교 카드 */
.compare-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 20px 0;
}

.compare-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  position: relative;
}

.compare-card.mcp-card {
  border-color: #bfdbfe;
  background: #fafcff;
}

.compare-card.skill-card {
  border-color: #bbf7d0;
  background: #fafff7;
}

.compare-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
  margin-bottom: 8px;
}

.mcp-card .compare-badge {
  background: #dbeafe;
  color: #1e40af;
}

.skill-card .compare-badge {
  background: #dcfce7;
  color: #166534;
}

.compare-role {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
}

.compare-features {
  list-style: none;
  padding: 0;
  margin: 12px 0;
}

.compare-features li {
  font-size: 13px;
  padding: 4px 0 4px 18px;
  position: relative;
  color: #475569;
}

.compare-features li::before {
  content: '•';
  position: absolute;
  left: 4px;
  color: #94a3b8;
}

.compare-analogy {
  font-size: 12px;
  color: #64748b;
  background: #f8fafc;
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: 12px;
}

/* 플로우 다이어그램 */
.flow-diagram {
  display: flex;
  align-items: stretch;
  gap: 8px;
  margin: 20px 0;
  overflow-x: auto;
  padding: 8px 0;
}

.flow-step {
  flex: 1;
  min-width: 150px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.flow-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #1e40af;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.flow-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.flow-content strong {
  font-size: 13px;
}

.flow-content span {
  font-size: 12px;
  color: #64748b;
}

.flow-arrow {
  display: flex;
  align-items: center;
  font-size: 18px;
  color: #94a3b8;
  flex-shrink: 0;
}

/* 벤치마크 뱃지 */
.badge-pass {
  display: inline-block;
  background: #dcfce7;
  color: #166534;
  font-weight: 700;
  font-size: 13px;
  padding: 2px 10px;
  border-radius: 10px;
}

.badge-partial {
  display: inline-block;
  background: #fef3c7;
  color: #854d0e;
  font-weight: 700;
  font-size: 13px;
  padding: 2px 10px;
  border-radius: 10px;
}

.badge-fail {
  display: inline-block;
  background: #fce4ec;
  color: #b71c1c;
  font-weight: 700;
  font-size: 13px;
  padding: 2px 10px;
  border-radius: 10px;
}

/* 반응형 */
@media (max-width: 640px) {
  .guide-container {
    padding: 24px 16px 60px;
  }

  .guide-header h1 {
    font-size: 24px;
  }

  .tool-grid {
    grid-template-columns: 1fr;
  }

  .api-name-grid {
    grid-template-columns: 1fr;
  }

  .path-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .compare-cards {
    grid-template-columns: 1fr;
  }

  .flow-diagram {
    flex-direction: column;
  }

  .flow-arrow {
    transform: rotate(90deg);
    justify-content: center;
  }
}
</style>
