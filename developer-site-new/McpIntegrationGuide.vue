<template>
  <div class="guide-container">
    <!-- 페이지 헤더 -->
    <div class="guide-header">
      <h1>AI 연동</h1>
      <p class="guide-subtitle">MCP + Skills로 결제 연동하기</p>
      <p class="guide-desc">
        MOBILPAY는 AI 코딩 도구에서 결제 연동을 빠르고 정확하게 수행할 수 있도록
        <strong>MCP 서버</strong>와 <strong>Agent Skill</strong> 두 가지를 제공합니다.
        MOBILPAY REST API 결제연동과 내죠여왕(NEZO) 알림톡 결제서비스를 모두 지원합니다.
      </p>
    </div>

    <!-- MCP vs Skills 비교 -->
    <section class="guide-section">
      <h2 id="overview">MCP와 Skills 한눈에 보기</h2>
      <p>두 가지 모두 AI가 결제 연동을 돕는 도구이지만 역할이 다릅니다.</p>
      <div class="compare-cards">
        <div class="compare-card mcp-card">
          <div class="compare-badge">MCP Server</div>
          <div class="compare-role">데이터 계층</div>
          <p>AI가 결제 연동 문서를 <strong>실시간 검색</strong>하고 API 명세, 코드 예제를 조회하는 도구입니다.</p>
          <ul class="compare-features">
            <li>키워드 기반 문서 검색 (BM25)</li>
            <li>MOBILPAY / NEZO API 전체 명세 조회</li>
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
            <li>MOBILPAY + NEZO 보안 규칙 자동 적용</li>
            <li>코드 생성 후 체크리스트 검증</li>
            <li>결제수단별 옵션 가이드</li>
          </ul>
          <div class="compare-analogy">비유: AI에게 결제 연동 <strong>전문가 지식</strong>을 내장</div>
        </div>
      </div>
      <div class="info-box" style="margin-top: 20px;">
        <div class="info-icon">&#x1F4A1;</div>
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
        MOBILPAY MCP 서버는 <strong>27개의 결제 연동 문서</strong>를 인덱싱하여 AI 모델에 제공합니다.
        MOBILPAY REST API 결제연동 18개 문서와 내죠여왕(NEZO) 알림톡 결제 9개 문서를 포함합니다.
      </p>
      <div class="info-box">
        <div class="info-icon">&#x1F4A1;</div>
        <div class="info-content">
          <strong>npm 패키지:</strong>
          <code>@mobilpay/mcp-server</code> &mdash; 별도 설치 없이 <code>npx</code>로 바로 실행 가능합니다.
        </div>
      </div>
    </section>

    <!-- 지원 도구 -->
    <section class="guide-section">
      <h2 id="supported-tools">지원 도구</h2>
      <p>다음 AI 코딩 도구에서 MOBILPAY MCP 서버와 Agent Skill을 사용할 수 있습니다.</p>
      <div class="tool-grid">
        <div class="tool-card" v-for="tool in supportedTools" :key="tool.name">
          <div class="tool-name">{{ tool.name }}</div>
          <div class="tool-desc">{{ tool.desc }}</div>
          <div class="tool-support">
            <span class="support-badge" :class="{ active: tool.mcp }">MCP</span>
            <span class="support-badge" :class="{ active: tool.skill }">Skill</span>
          </div>
        </div>
      </div>
    </section>

    <!-- MCP 설치 및 설정 -->
    <section class="guide-section">
      <h2 id="mcp-setup">MCP 설치 및 설정</h2>
      <div class="prereq-box">
        <strong>사전 요구사항:</strong> Node.js 18 이상이 설치되어 있어야 합니다.
      </div>

      <div class="setup-tabs">
        <button
          v-for="tab in mcpSetupTabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeMcpTab === tab.id }]"
          @click="activeMcpTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Cursor MCP -->
      <div v-show="activeMcpTab === 'cursor'" class="tab-content">
        <h3>Cursor MCP 설정</h3>
        <p><strong>방법 1: 프로젝트 단위 설정</strong></p>
        <p>프로젝트 루트에 <code>.cursor/mcp.json</code> 파일을 생성합니다.</p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">.cursor/mcp.json</span>
            <button class="copy-btn" @click="copyCode('mcp-cursor')">{{ copiedId === 'mcp-cursor' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.mcpCursor }}</code></pre>
        </div>
        <p><strong>방법 2: 글로벌 설정</strong></p>
        <p><code>~/.cursor/mcp.json</code> 파일에 위 내용을 추가하면 모든 프로젝트에서 사용할 수 있습니다.</p>
        <div class="warn-box">
          <strong>MCP 키 주의:</strong> Cursor는 최상위 키가 <code>"mcpServers"</code>입니다.
        </div>
      </div>

      <!-- Kiro MCP -->
      <div v-show="activeMcpTab === 'kiro'" class="tab-content">
        <h3>Kiro MCP 설정</h3>
        <p>프로젝트 루트에 <code>.kiro/settings/mcp.json</code> 파일을 생성합니다.</p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">.kiro/settings/mcp.json</span>
            <button class="copy-btn" @click="copyCode('mcp-kiro')">{{ copiedId === 'mcp-kiro' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.mcpKiro }}</code></pre>
        </div>
        <div class="warn-box">
          <strong>MCP 키 주의:</strong> Kiro는 최상위 키가 <code>"mcpServers"</code>입니다 (Cursor와 동일).
        </div>
      </div>

      <!-- Windsurf MCP -->
      <div v-show="activeMcpTab === 'windsurf'" class="tab-content">
        <h3>Windsurf MCP 설정</h3>
        <p><code>~/.codeium/windsurf/mcp_config.json</code> 파일을 열고 다음을 추가합니다.</p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">mcp_config.json</span>
            <button class="copy-btn" @click="copyCode('mcp-windsurf')">{{ copiedId === 'mcp-windsurf' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.mcpWindsurf }}</code></pre>
        </div>
      </div>

      <!-- Claude Desktop MCP -->
      <div v-show="activeMcpTab === 'claude-desktop'" class="tab-content">
        <h3>Claude Desktop MCP 설정</h3>
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
            <button class="copy-btn" @click="copyCode('mcp-claude-desktop')">{{ copiedId === 'mcp-claude-desktop' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.mcpClaudeDesktop }}</code></pre>
        </div>
      </div>

      <!-- VS Code Copilot MCP -->
      <div v-show="activeMcpTab === 'vscode-copilot'" class="tab-content">
        <h3>VS Code (GitHub Copilot) MCP 설정</h3>
        <p>프로젝트 루트에 <code>.vscode/mcp.json</code> 파일을 생성합니다.</p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">.vscode/mcp.json</span>
            <button class="copy-btn" @click="copyCode('mcp-vscode')">{{ copiedId === 'mcp-vscode' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.mcpVscode }}</code></pre>
        </div>
        <div class="warn-box">
          <strong>MCP 키 주의:</strong> VS Code는 최상위 키가 <code>"servers"</code>입니다 (<code>"mcpServers"</code>가 아닙니다).
          VS Code 설정에서 <code>"chat.mcp.enabled": true</code> 추가가 필요합니다.
        </div>
      </div>

      <!-- Claude Code MCP -->
      <div v-show="activeMcpTab === 'claude-code'" class="tab-content">
        <h3>Claude Code MCP 설정</h3>
        <p>터미널에서 다음 명령어를 실행합니다.</p>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">Terminal</span>
            <button class="copy-btn" @click="copyCode('mcp-claude-code')">{{ copiedId === 'mcp-claude-code' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.mcpClaudeCode }}</code></pre>
        </div>
      </div>

      <!-- MCP 설정 키 비교 테이블 -->
      <h3>IDE별 MCP 설정 비교</h3>
      <table class="param-table">
        <thead>
          <tr>
            <th>IDE</th>
            <th>최상위 키</th>
            <th>파일 위치</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in mcpConfigCompare" :key="row.ide">
            <td><strong>{{ row.ide }}</strong></td>
            <td><code>{{ row.key }}</code></td>
            <td><code>{{ row.path }}</code></td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 제공 도구 (MCP Tools) -->
    <section class="guide-section">
      <h2 id="mcp-tools">제공 도구 (MCP Tools)</h2>
      <p>MOBILPAY MCP 서버는 <strong>6개</strong>의 도구를 제공합니다.</p>

      <!-- 통합 검색 도구 -->
      <div class="tool-detail" v-for="tool in mcpTools" :key="tool.name">
        <h3>
          <code>{{ tool.name }}</code>
          <span v-if="tool.service" class="service-badge" :class="tool.service">{{ tool.serviceLabel }}</span>
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
        <a href="https://llmstxt.org" target="_blank" rel="noopener noreferrer">llms.txt 표준</a>을
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
          <div class="example-title">
            {{ example.title }}
            <span v-if="example.service" class="service-badge small" :class="example.service">{{ example.serviceLabel }}</span>
          </div>
          <div class="example-prompt">{{ example.prompt }}</div>
        </div>
      </div>
    </section>

    <!-- Agent Skill IDE별 설정 -->
    <section class="guide-section">
      <h2 id="skill">Agent Skill</h2>
      <p>
        Agent Skill은 AI의 행동을 가이드하는 도메인 전문 지식 패키지입니다.
        MCP가 문서를 검색해주는 "검색 엔진"이라면, Skill은 AI가 코드를 작성할 때
        보안 규칙과 결제 플로우를 자동으로 적용하게 해주는 "전문가 매뉴얼"입니다.
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

      <h3>IDE별 Skill 설정 방법</h3>
      <p>각 AI 코딩 도구는 서로 다른 형식으로 Skill을 인식합니다. 사용하는 IDE에 맞는 탭을 선택하세요.</p>

      <!-- IDE별 Skill 비교 테이블 -->
      <table class="param-table" style="margin-bottom: 24px;">
        <thead>
          <tr>
            <th>항목</th>
            <th>Cursor</th>
            <th>Kiro</th>
            <th>VS Code Copilot</th>
            <th>Claude Code</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Skill 형식</strong></td>
            <td><code>.mdc</code></td>
            <td><code>.md</code></td>
            <td><code>.md</code></td>
            <td><code>SKILL.md</code></td>
          </tr>
          <tr>
            <td><strong>파일 위치</strong></td>
            <td><code>.cursor/rules/</code></td>
            <td><code>.kiro/steering/</code></td>
            <td><code>.github/</code></td>
            <td><code>skills/*/</code></td>
          </tr>
          <tr>
            <td><strong>조건부 적용</strong></td>
            <td>가능</td>
            <td>불가 (항상 로드)</td>
            <td>불가 (항상 로드)</td>
            <td>가능</td>
          </tr>
          <tr>
            <td><strong>추가 설정</strong></td>
            <td>.mdc 파일 배치</td>
            <td>steering 파일 배치</td>
            <td>instructions 파일 생성</td>
            <td>불필요</td>
          </tr>
        </tbody>
      </table>

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

      <!-- Cursor Skill -->
      <div v-show="activeSkillTab === 'skill-cursor'" class="tab-content">
        <h3>Cursor &mdash; Rules (.mdc 파일)</h3>
        <p>
          Cursor는 <code>.cursor/rules/</code> 디렉토리의 <strong>.mdc 파일</strong>로 Skill을 인식합니다.
          YAML frontmatter로 적용 조건을 제어할 수 있어, 결제 관련 요청 시에만 규칙이 활성화됩니다.
        </p>

        <h4>파일 배치 구조</h4>
        <div class="code-block">
          <div class="code-header"><span class="code-lang">프로젝트 구조</span></div>
          <pre><code>프로젝트 루트/
&#9500;&#9472;&#9472; .cursor/
&#9474;   &#9500;&#9472;&#9472; mcp.json                          &#8592; MCP 서버 설정
&#9474;   &#9492;&#9472;&#9472; rules/
&#9474;       &#9500;&#9472;&#9472; mobilpay-integration.mdc      &#8592; MOBILPAY 결제연동 규칙
&#9474;       &#9492;&#9472;&#9472; nezo-integration.mdc          &#8592; 내죠여왕 결제연동 규칙</code></pre>
        </div>

        <h4>.mdc 파일의 frontmatter 구조</h4>
        <div class="code-block">
          <div class="code-header"><span class="code-lang">YAML frontmatter</span></div>
          <pre><code>---
description: MOBILPAY(KG&#xD30C;&#xC774;&#xB0B8;&#xC15C;) REST API &#xACB0;&#xC81C; &#xC5F0;&#xB3D9; &#xCF54;&#xB4DC; &#xC791;&#xC131; &#xC2DC; &#xC801;&#xC6A9;
globs:
alwaysApply: false
---</code></pre>
        </div>

        <table class="param-table">
          <thead>
            <tr><th>필드</th><th>설정값</th><th>의미</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code>description</code></td>
              <td>스킬 설명</td>
              <td>Agent가 이 규칙을 언제 적용할지 판단하는 기준</td>
            </tr>
            <tr>
              <td><code>globs</code></td>
              <td>(비워둠)</td>
              <td>특정 파일 패턴에만 적용 시 설정 (예: <code>**/*.ts</code>)</td>
            </tr>
            <tr>
              <td><code>alwaysApply</code></td>
              <td><code>false</code></td>
              <td><strong>Agent-Requested</strong> 모드: 관련 키워드 감지 시 자동 활성화</td>
            </tr>
          </tbody>
        </table>

        <h4>적용 모드 종류</h4>
        <table class="param-table">
          <thead>
            <tr><th>모드</th><th>alwaysApply</th><th>동작</th></tr>
          </thead>
          <tbody>
            <tr><td>Always</td><td><code>true</code></td><td>모든 채팅에 항상 적용</td></tr>
            <tr><td>Agent-Requested</td><td><code>false</code> + globs 비움</td><td>Agent가 description 기반으로 자동 판단 (권장)</td></tr>
            <tr><td>Auto Attached</td><td><code>false</code> + globs 설정</td><td>특정 파일 패턴 작업 시 자동 적용</td></tr>
          </tbody>
        </table>

        <div class="download-section">
          <p><strong>샘플 파일 다운로드:</strong></p>
          <div class="download-buttons">
            <a :href="downloadBase + '/cursor/mcp.json'" download class="download-btn">mcp.json</a>
            <a :href="downloadBase + '/cursor/rules/mobilpay-integration.mdc'" download class="download-btn">mobilpay-integration.mdc</a>
            <a :href="downloadBase + '/cursor/rules/nezo-integration.mdc'" download class="download-btn">nezo-integration.mdc</a>
            <a :href="downloadBase + '/mobilpay-SKILL.md'" download class="download-btn">MOBILPAY SKILL.md</a>
            <a :href="downloadBase + '/nezo-SKILL.md'" download class="download-btn">NEZO SKILL.md</a>
          </div>
          <p class="download-hint">
            <code>.mdc</code> 파일은 <code>.cursor/rules/</code>에 배치하세요.
            <code>SKILL.md</code>는 Cursor Rules 대신 <code>.cursorrules</code> 파일에 내용을 붙여넣을 때 사용합니다.
          </p>
        </div>
      </div>

      <!-- Kiro Skill -->
      <div v-show="activeSkillTab === 'skill-kiro'" class="tab-content">
        <h3>Kiro &mdash; Steering Files</h3>
        <p>
          Kiro(AWS의 AI IDE)는 <code>.kiro/steering/</code> 디렉토리의 <strong>일반 마크다운 파일</strong>로 Skill을 인식합니다.
          별도의 frontmatter 없이 마크다운 파일을 배치하면 됩니다.
        </p>

        <h4>파일 배치 구조</h4>
        <div class="code-block">
          <div class="code-header"><span class="code-lang">프로젝트 구조</span></div>
          <pre><code>프로젝트 루트/
&#9500;&#9472;&#9472; .kiro/
&#9474;   &#9500;&#9472;&#9472; settings/
&#9474;   &#9474;   &#9492;&#9472;&#9472; mcp.json                         &#8592; MCP 서버 설정
&#9474;   &#9492;&#9472;&#9472; steering/
&#9474;       &#9500;&#9472;&#9472; mobilpay-integration.md           &#8592; MOBILPAY 결제연동 가이드
&#9474;       &#9492;&#9472;&#9472; nezo-integration.md               &#8592; 내죠여왕 결제연동 가이드</code></pre>
        </div>

        <h4>Cursor Rules와의 차이점</h4>
        <table class="param-table">
          <thead>
            <tr><th>항목</th><th>Cursor Rules (.mdc)</th><th>Kiro Steering (.md)</th></tr>
          </thead>
          <tbody>
            <tr><td>파일 형식</td><td>YAML frontmatter + Markdown</td><td>일반 Markdown</td></tr>
            <tr><td>조건부 적용</td><td><code>alwaysApply</code>, <code>globs</code>로 제어</td><td>항상 컨텍스트로 제공</td></tr>
            <tr><td>위치</td><td><code>.cursor/rules/</code></td><td><code>.kiro/steering/</code></td></tr>
          </tbody>
        </table>

        <div class="info-box">
          <div class="info-icon">&#x1F4A1;</div>
          <div class="info-content">
            Kiro의 <strong>Hooks</strong> 기능을 활용하면 결제 관련 코드 저장 시 자동으로 보안 검증을 수행할 수도 있습니다.
            Hooks는 선택사항으로, Steering 파일만으로도 AI가 규칙을 인지합니다.
          </div>
        </div>

        <div class="download-section">
          <p><strong>샘플 파일 다운로드:</strong></p>
          <div class="download-buttons">
            <a :href="downloadBase + '/kiro/settings/mcp.json'" download class="download-btn">mcp.json</a>
            <a :href="downloadBase + '/kiro/steering/mobilpay-integration.md'" download class="download-btn">mobilpay-integration.md</a>
            <a :href="downloadBase + '/kiro/steering/nezo-integration.md'" download class="download-btn">nezo-integration.md</a>
            <a :href="downloadBase + '/mobilpay-SKILL.md'" download class="download-btn">MOBILPAY SKILL.md</a>
            <a :href="downloadBase + '/nezo-SKILL.md'" download class="download-btn">NEZO SKILL.md</a>
          </div>
          <p class="download-hint">
            steering 파일은 <code>.kiro/steering/</code>에 배치하세요.
            <code>SKILL.md</code>는 원본 참조용으로 제공됩니다.
          </p>
        </div>
      </div>

      <!-- VS Code + Copilot Skill -->
      <div v-show="activeSkillTab === 'skill-vscode-copilot'" class="tab-content">
        <h3>VS Code + GitHub Copilot &mdash; Copilot Instructions</h3>
        <p>
          GitHub Copilot은 <code>.github/copilot-instructions.md</code> <strong>단일 파일</strong>로 Skill을 인식합니다.
          MOBILPAY와 NEZO 규칙이 하나의 파일에 통합되어 있습니다.
        </p>

        <h4>파일 배치 구조</h4>
        <div class="code-block">
          <div class="code-header"><span class="code-lang">프로젝트 구조</span></div>
          <pre><code>프로젝트 루트/
&#9500;&#9472;&#9472; .vscode/
&#9474;   &#9492;&#9472;&#9472; mcp.json                          &#8592; MCP 서버 설정
&#9500;&#9472;&#9472; .github/
&#9474;   &#9492;&#9472;&#9472; copilot-instructions.md           &#8592; Copilot 지침 (MOBILPAY + NEZO 통합)</code></pre>
        </div>

        <h4>설정 활성화 확인</h4>
        <div class="step-list">
          <div class="step-item">
            <span class="step-num">1</span>
            <span><code>Cmd+Shift+P</code> &rarr; <code>Preferences: Open Settings (UI)</code></span>
          </div>
          <div class="step-item">
            <span class="step-num">2</span>
            <span><code>github.copilot.chat.codeGeneration.useInstructionFiles</code> 검색</span>
          </div>
          <div class="step-item">
            <span class="step-num">3</span>
            <span>체크박스 활성화 확인</span>
          </div>
        </div>

        <div class="warn-box">
          <strong>주의:</strong> Copilot Instructions는 모든 Copilot Chat 세션에 항상 적용됩니다.
          저장소에 커밋하면 팀원 모두에게 적용되므로 주의하세요.
          또한 MCP 설정 파일의 최상위 키는 <code>"servers"</code>입니다 (<code>"mcpServers"</code>가 아닙니다).
        </div>

        <div class="download-section">
          <p><strong>샘플 파일 다운로드:</strong></p>
          <div class="download-buttons">
            <a :href="downloadBase + '/vscode-copilot/vscode/mcp.json'" download class="download-btn">mcp.json</a>
            <a :href="downloadBase + '/vscode-copilot/github/copilot-instructions.md'" download class="download-btn">copilot-instructions.md</a>
            <a :href="downloadBase + '/mobilpay-SKILL.md'" download class="download-btn">MOBILPAY SKILL.md</a>
            <a :href="downloadBase + '/nezo-SKILL.md'" download class="download-btn">NEZO SKILL.md</a>
          </div>
          <p class="download-hint">
            <code>mcp.json</code>은 <code>.vscode/</code>에, <code>copilot-instructions.md</code>는 <code>.github/</code>에 배치하세요.
            <code>SKILL.md</code>는 원본 참조용으로 제공됩니다.
          </p>
        </div>
      </div>

      <!-- Claude Code Skill -->
      <div v-show="activeSkillTab === 'skill-claude-code'" class="tab-content">
        <h3>Claude Code &mdash; 추가 설정 불필요</h3>
        <p>
          Claude Code는 프로젝트의 <code>skills/</code> 디렉토리에 있는 <code>SKILL.md</code> 파일을
          <strong>네이티브로 인식</strong>합니다. 별도의 변환이나 설정이 필요 없습니다.
        </p>

        <h4>자동 인식 항목</h4>
        <table class="param-table">
          <thead>
            <tr><th>항목</th><th>파일</th><th>동작</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>MOBILPAY Skill</td>
              <td><code>skills/mobilpay-integration/SKILL.md</code></td>
              <td>결제 연동 요청 시 자동 활성화</td>
            </tr>
            <tr>
              <td>NEZO Skill</td>
              <td><code>skills/nezo-integration/SKILL.md</code></td>
              <td>알림톡 결제 요청 시 자동 활성화</td>
            </tr>
            <tr>
              <td>레퍼런스 문서</td>
              <td><code>skills/*/references/**/*.md</code></td>
              <td>Skill에서 참조 시 자동 로드</td>
            </tr>
            <tr>
              <td>평가 데이터</td>
              <td><code>skills/*/evals/evals.json</code></td>
              <td>Skill 품질 평가에 활용</td>
            </tr>
          </tbody>
        </table>

        <h4>Claude Code의 장점</h4>
        <div class="info-box">
          <div class="info-icon">&#x2705;</div>
          <div class="info-content">
            <ul style="margin: 0; padding-left: 18px;">
              <li><strong>Reference 직접 참조:</strong> <code>references/</code> 디렉토리의 상세 API 문서를 직접 읽어 MCP 없이도 정확한 코드 생성 가능</li>
              <li><strong>변환 불필요:</strong> 다른 IDE는 형식 변환이 필요하지만, Claude Code는 원본 그대로 사용</li>
              <li><strong>평가 지원:</strong> <code>evals.json</code>으로 Skill의 코드 생성 품질을 측정하고 개선 가능</li>
            </ul>
          </div>
        </div>

        <h4>MCP 서버 추가 (선택)</h4>
        <div class="code-block">
          <div class="code-header">
            <span class="code-lang">Terminal</span>
            <button class="copy-btn" @click="copyCode('mcp-claude-code')">{{ copiedId === 'mcp-claude-code' ? '복사됨!' : '복사' }}</button>
          </div>
          <pre><code>{{ codeSnippets.mcpClaudeCode }}</code></pre>
        </div>
        <p><code>references/</code> 디렉토리가 있으므로 MCP 없이도 동작하지만, MCP를 추가하면 BM25 검색 등 고급 기능을 활용할 수 있습니다.</p>
      </div>
    </section>

    <!-- MCP + Skill 함께 사용하기 -->
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
        <div class="flow-arrow">&rarr;</div>
        <div class="flow-step">
          <div class="flow-number">2</div>
          <div class="flow-content">
            <strong>Skill 적용</strong>
            <span>결제 플로우, 보안 규칙, 체크리스트 자동 로드</span>
          </div>
        </div>
        <div class="flow-arrow">&rarr;</div>
        <div class="flow-step">
          <div class="flow-number">3</div>
          <div class="flow-content">
            <strong>MCP 검색</strong>
            <span>거래등록 API 명세, 간편결제 파라미터 조회</span>
          </div>
        </div>
        <div class="flow-arrow">&rarr;</div>
        <div class="flow-step">
          <div class="flow-number">4</div>
          <div class="flow-content">
            <strong>코드 생성</strong>
            <span>정확한 파라미터 + 보안 규칙이 모두 적용된 코드</span>
          </div>
        </div>
      </div>

      <h3>벤치마크 결과</h3>
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
      <p>MCP 서버와 Skill은 AI 모델이 코드를 생성할 때 다음 보안 규칙을 준수하도록 안내합니다.</p>

      <h3>MOBILPAY REST API</h3>
      <table class="security-table">
        <thead>
          <tr><th>규칙</th><th>설명</th></tr>
        </thead>
        <tbody>
          <tr v-for="rule in securityRulesMobilpay" :key="rule.name">
            <td><strong>{{ rule.name }}</strong></td>
            <td>{{ rule.desc }}</td>
          </tr>
        </tbody>
      </table>

      <h3>내죠여왕(NEZO) 알림톡 결제</h3>
      <table class="security-table">
        <thead>
          <tr><th>규칙</th><th>설명</th></tr>
        </thead>
        <tbody>
          <tr v-for="rule in securityRulesNezo" :key="rule.name">
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
      <p>MCP 서버 또는 Skill 사용 중 문제가 발생하면 아래로 문의해 주세요.</p>
      <table class="support-table">
        <thead>
          <tr><th>구분</th><th>연락처</th></tr>
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
      activeMcpTab: 'cursor',
      activeSkillTab: 'skill-cursor',
      copiedId: null,
      openFaq: null,
      downloadBase: '/downloads',

      supportedTools: [
        { name: 'Cursor', desc: 'AI 기반 코드 에디터', mcp: true, skill: true },
        { name: 'Kiro', desc: 'AWS의 AI IDE', mcp: true, skill: true },
        { name: 'Windsurf', desc: 'AI 코딩 어시스턴트', mcp: true, skill: false },
        { name: 'Claude Desktop', desc: 'Anthropic의 Claude 데스크톱 앱', mcp: true, skill: false },
        { name: 'VS Code (Copilot)', desc: 'GitHub Copilot MCP 확장', mcp: true, skill: true },
        { name: 'Claude Code', desc: 'CLI 기반 AI 코딩 에이전트', mcp: true, skill: true },
      ],

      mcpSetupTabs: [
        { id: 'cursor', label: 'Cursor' },
        { id: 'kiro', label: 'Kiro' },
        { id: 'windsurf', label: 'Windsurf' },
        { id: 'claude-desktop', label: 'Claude Desktop' },
        { id: 'vscode-copilot', label: 'VS Code (Copilot)' },
        { id: 'claude-code', label: 'Claude Code' },
      ],

      skillSetupTabs: [
        { id: 'skill-cursor', label: 'Cursor' },
        { id: 'skill-kiro', label: 'Kiro' },
        { id: 'skill-vscode-copilot', label: 'VS Code (Copilot)' },
        { id: 'skill-claude-code', label: 'Claude Code' },
      ],

      mcpConfigCompare: [
        { ide: 'Cursor', key: 'mcpServers', path: '.cursor/mcp.json' },
        { ide: 'Kiro', key: 'mcpServers', path: '.kiro/settings/mcp.json' },
        { ide: 'Windsurf', key: 'mcpServers', path: '~/.codeium/windsurf/mcp_config.json' },
        { ide: 'Claude Desktop', key: 'mcpServers', path: 'claude_desktop_config.json' },
        { ide: 'VS Code (Copilot)', key: 'servers', path: '.vscode/mcp.json' },
        { ide: 'Claude Code', key: '(CLI 명령)', path: 'claude mcp add ...' },
      ],

      codeSnippets: {
        mcpCursor: JSON.stringify({
          mcpServers: {
            mobilpay: {
              command: 'npx',
              args: ['-y', '@mobilpay/mcp-server@latest'],
            },
          },
        }, null, 2),
        mcpKiro: JSON.stringify({
          mcpServers: {
            mobilpay: {
              command: 'npx',
              args: ['-y', '@mobilpay/mcp-server@latest'],
            },
          },
        }, null, 2),
        mcpWindsurf: JSON.stringify({
          mcpServers: {
            mobilpay: {
              command: 'npx',
              args: ['-y', '@mobilpay/mcp-server@latest'],
            },
          },
        }, null, 2),
        mcpClaudeDesktop: JSON.stringify({
          mcpServers: {
            mobilpay: {
              command: 'npx',
              args: ['-y', '@mobilpay/mcp-server@latest'],
            },
          },
        }, null, 2),
        mcpVscode: JSON.stringify({
          servers: {
            mobilpay: {
              command: 'npx',
              args: ['-y', '@mobilpay/mcp-server@latest'],
            },
          },
        }, null, 2),
        mcpClaudeCode: 'claude mcp add mobilpay -- npx -y @mobilpay/mcp-server@latest',
      },

      skillFeatures: [
        { name: '결제 플로우 자동 설계', desc: '일반결제/하이브리드결제/알림톡결제 플로우를 자동으로 파악하고 전체 구현 단계를 가이드합니다.' },
        { name: 'MOBILPAY 보안 규칙 5가지', desc: 'skey 환경변수, HMAC 서버사이드, noti_url 멱등성, 결제승인 백엔드, 호스트 분기를 자동 적용합니다.' },
        { name: 'NEZO 보안 규칙 7가지', desc: 'MAC_KEY 보호, HmacSHA256 서버사이드, callback_url 멱등성, 전문 유효시간 10분, HTTP 200 응답 등을 자동 적용합니다.' },
        { name: '코드 생성 후 체크리스트', desc: 'MOBILPAY 8가지, NEZO 8가지 항목을 자동 검증합니다.' },
        { name: '결제수단별 옵션 가이드', desc: '결제수단별 올바른 파라미터 접두어와 필수값을 안내합니다.' },
        { name: '27개 참조 문서 번들링', desc: 'MOBILPAY API 11개 + 가이드 5개 + 코드표 2개, NEZO API 5개 + 가이드 2개 + 레퍼런스 2개가 내장되어 있습니다.' },
      ],

      mcpTools: [
        {
          name: 'get-docs',
          service: 'both',
          serviceLabel: '통합',
          description: '키워드 기반으로 MOBILPAY + NEZO 결제 연동 문서를 통합 검색합니다. BM25 알고리즘을 사용하여 27개 문서에서 가장 관련성 높은 결과를 반환합니다.',
          params: [
            { name: 'keywords', type: 'string[]', required: true, desc: '검색 키워드 배열. 예: ["거래등록", "sid"]' },
          ],
        },
        {
          name: 'document-by-id',
          service: 'both',
          serviceLabel: '통합',
          description: '문서 ID로 전체 문서를 조회합니다. id=0을 입력하면 전체 27개 문서 목록을 반환합니다.',
          params: [
            { name: 'id', type: 'number', required: true, desc: '문서 ID. 0: 전체 문서 목록 반환' },
          ],
        },
        {
          name: 'get-payment-api-spec',
          service: 'mobilpay',
          serviceLabel: 'MOBILPAY',
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
          name: 'get-payment-code-example',
          service: 'mobilpay',
          serviceLabel: 'MOBILPAY',
          description: 'MOBILPAY API별 언어별 예제 코드를 조회합니다.',
          params: [
            { name: 'api_name', type: 'string', required: true, desc: 'API 이름. 예: hmac, registration' },
            { name: 'language', type: 'string', required: false, desc: '프로그래밍 언어 필터. java, python, node, php, csharp' },
          ],
        },
        {
          name: 'get-nezo-api-spec',
          service: 'nezo',
          serviceLabel: 'NEZO',
          description: '내죠여왕(NEZO) API의 전체 명세를 조회합니다. 알림톡 결제 요청, 조회, 취소 등의 API 명세를 반환합니다.',
          params: [
            { name: 'api_name', type: 'string', required: true, desc: 'API 이름. 예: send, callback, cancel' },
          ],
          apiNames: [
            { name: 'send', desc: '결제 요청 (/send)' },
            { name: 'callback', desc: '콜백/리턴 URL' },
            { name: 'search', desc: '결제 조회 (/send/view)' },
            { name: 'cancel', desc: '결제 취소 (/cancel)' },
            { name: 'resend', desc: '결제 재요청' },
          ],
        },
        {
          name: 'get-nezo-code-example',
          service: 'nezo',
          serviceLabel: 'NEZO',
          description: '내죠여왕(NEZO) API별 언어별 예제 코드를 조회합니다.',
          params: [
            { name: 'api_name', type: 'string', required: true, desc: 'API 이름. 예: send, callback, mac' },
            { name: 'language', type: 'string', required: false, desc: '프로그래밍 언어 필터. java, python, node, php, csharp' },
          ],
        },
      ],

      usageExamples: [
        {
          title: '결제 연동 시작하기',
          service: 'mobilpay',
          serviceLabel: 'MOBILPAY',
          prompt: 'MOBILPAY 신용카드 결제 연동을 시작하려고 합니다. 거래등록부터 결제 완료까지 전체 플로우를 알려주세요.',
        },
        {
          title: '특정 API 코드 생성',
          service: 'mobilpay',
          serviceLabel: 'MOBILPAY',
          prompt: 'MOBILPAY 거래등록 API를 Node.js로 호출하는 코드를 작성해주세요. 신용카드 결제로 10,000원을 결제합니다.',
        },
        {
          title: 'HMAC 검증 구현',
          service: 'mobilpay',
          serviceLabel: 'MOBILPAY',
          prompt: 'MOBILPAY HMAC 무결성 검증 코드를 Python으로 작성해주세요.',
        },
        {
          title: 'noti_url 구현',
          service: 'mobilpay',
          serviceLabel: 'MOBILPAY',
          prompt: '결제 완료 후 noti_url로 결과를 수신하는 서버 코드를 작성해주세요. 중복 호출 방어 로직도 포함해주세요.',
        },
        {
          title: '알림톡 결제 요청',
          service: 'nezo',
          serviceLabel: 'NEZO',
          prompt: '내죠여왕 알림톡 결제요청 코드를 Node.js로 작성해주세요. MAC 생성 로직도 포함해주세요.',
        },
        {
          title: '알림톡 콜백 핸들러',
          service: 'nezo',
          serviceLabel: 'NEZO',
          prompt: '내죠여왕 callback_url 핸들러를 구현해주세요. MAC 검증과 중복 처리 방어 로직을 포함해주세요.',
        },
        {
          title: '에러 해결',
          service: 'mobilpay',
          serviceLabel: 'MOBILPAY',
          prompt: 'MOBILPAY 결제 연동 중 에러코드 M110이 발생했습니다. 원인과 해결 방법을 알려주세요.',
        },
      ],

      securityRulesMobilpay: [
        { name: 'skey 보호', desc: 'skey(서비스 키)는 절대 클라이언트 코드에 포함하지 않습니다. 반드시 환경변수에서 로드합니다.' },
        { name: 'HMAC 서버사이드', desc: 'HMAC 무결성 검증은 반드시 서버에서만 수행합니다. 메시지: amount + ok_url + trade_id + time_stamp' },
        { name: 'noti_url 멱등성', desc: 'noti_url은 SUCCESS 수신까지 최대 20회 반복 호출됩니다. tid 기반 중복 처리 방어 로직을 포함합니다.' },
        { name: '결제승인 백엔드', desc: '결제승인 API(/MUP/api/approval)는 반드시 백엔드에서만 호출합니다.' },
        { name: '호스트 구분', desc: '테스트: test.mobilians.co.kr / 운영: mup.mobilians.co.kr' },
      ],

      securityRulesNezo: [
        { name: 'svc_id & MAC_KEY 보호', desc: 'svc_id와 MAC_KEY는 절대 클라이언트 코드에 포함하지 않습니다. 반드시 환경변수에서 로드합니다.' },
        { name: 'MAC(HmacSHA256) 서버사이드', desc: '요청 KEY: svc_id + send_dttm + MAC_KEY, 응답 KEY: svc_id + sys_dttm + MAC_KEY. 결과는 64자리 대문자 HEX.' },
        { name: 'callback_url 멱등성', desc: 'HTTP 200 미수신 시 재시도 발생. trade_no 기반 중복 방어 필수.' },
        { name: '결제 API 백엔드', desc: '결제요청/조회/취소 API는 반드시 서버 사이드에서만 호출합니다.' },
        { name: '전문 유효시간 10분', desc: 'send_dttm 기준 10분 초과 시 오류 발생. 타임스탬프를 적절히 관리하세요.' },
        { name: 'callback_url 형식', desc: '완전한 URL 형식 필수. (예: https://example.com/pay/callback)' },
        { name: 'HTTP 200 응답 필수', desc: 'callback_url 핸들러는 반드시 HTTP 200을 반환해야 합니다.' },
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
          a: 'Cursor(.cursor/rules/*.mdc), Kiro(.kiro/steering/*.md), VS Code Copilot(.github/copilot-instructions.md), Claude Code(네이티브 SKILL.md)에서 사용할 수 있습니다. 각 IDE별 설정 파일을 위 가이드에서 다운로드할 수 있습니다.',
        },
        {
          q: 'IDE별 Skill 파일 형식이 왜 다른가요?',
          a: '각 IDE가 자체적인 AI 가이드 시스템을 운영하기 때문입니다. Cursor는 .mdc(frontmatter), Kiro는 plain .md(steering), VS Code Copilot은 copilot-instructions.md, Claude Code는 SKILL.md(frontmatter)를 사용합니다. 본 가이드에서 각 형식에 맞는 변환된 파일을 다운로드할 수 있습니다.',
        },
        {
          q: 'MOBILPAY와 내죠여왕(NEZO) 연동을 동시에 사용할 수 있나요?',
          a: '네, 가능합니다. MCP 서버 하나로 두 서비스의 문서를 모두 검색할 수 있고, Skill 파일도 서비스별로 분리되어 있어 해당 서비스를 언급하면 자동으로 적절한 규칙이 적용됩니다.',
        },
        {
          q: 'MCP 서버가 외부로 데이터를 전송하나요?',
          a: '아닙니다. MCP 서버와 Skill 모두 로컬에서 실행되며, 외부 서버로의 네트워크 요청은 발생하지 않습니다.',
        },
        {
          q: 'MCP 서버의 문서는 최신 상태인가요?',
          a: '@latest 태그를 사용하면 npm에 게시된 최신 버전의 문서를 항상 사용할 수 있습니다. 특정 버전을 고정하려면 @mobilpay/mcp-server@2.0.0과 같이 버전을 명시하세요.',
        },
        {
          q: '어떤 결제수단을 지원하나요?',
          a: 'MOBILPAY: 휴대폰(MC), 신용카드(CN), 실계좌이체(RA), 가상계좌(VA), 간편결제(카카오페이, 토스, 네이버페이 등). NEZO: 휴대폰(MC), 신용카드(CN).',
        },
      ],
    };
  },

  methods: {
    copyCode(id) {
      var snippetMap = {
        'mcp-cursor': this.codeSnippets.mcpCursor,
        'mcp-kiro': this.codeSnippets.mcpKiro,
        'mcp-windsurf': this.codeSnippets.mcpWindsurf,
        'mcp-claude-desktop': this.codeSnippets.mcpClaudeDesktop,
        'mcp-vscode': this.codeSnippets.mcpVscode,
        'mcp-claude-code': this.codeSnippets.mcpClaudeCode,
        'llms-txt': 'https://www.mobilians.co.kr/doc/llms.txt',
      };
      var text = snippetMap[id];
      if (!text) return;

      var self = this;
      var onSuccess = function () {
        self.copiedId = id;
        setTimeout(function () { self.copiedId = null; }, 2000);
      };

      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(text).then(onSuccess);
      } else {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          onSuccess();
        } catch (e) {
          // 복사 실패 시 무시
        }
        document.body.removeChild(textarea);
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

.guide-section h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 20px 0 8px;
  color: #334155;
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

/* 정보/경고 박스 */
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

.warn-box {
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 12px 0;
  font-size: 14px;
  color: #854d0e;
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
  margin-bottom: 8px;
}

.tool-support {
  display: flex;
  gap: 6px;
}

.support-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #94a3b8;
}

.support-badge.active {
  background: #dcfce7;
  color: #166534;
}

/* 서비스 뱃지 */
.service-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 8px;
  vertical-align: middle;
}

.service-badge.both {
  background: #e0e7ff;
  color: #3730a3;
}

.service-badge.mobilpay {
  background: #dbeafe;
  color: #1e40af;
}

.service-badge.nezo {
  background: #dcfce7;
  color: #166534;
}

.service-badge.small {
  font-size: 10px;
  padding: 1px 6px;
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

/* 스텝 목록 */
.step-list {
  margin: 16px 0;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 14px;
}

.step-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1e40af;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

/* 다운로드 섹션 */
.download-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;
}

.download-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #1e40af;
  color: #fff;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}

.download-btn:hover {
  background: #1e3a8a;
}

.download-hint {
  font-size: 13px;
  color: #64748b;
  margin: 8px 0 0;
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
  content: '\2022';
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

  .download-buttons {
    flex-direction: column;
  }

  .download-btn {
    text-align: center;
    justify-content: center;
  }

  .param-table {
    font-size: 12px;
  }

  .param-table th,
  .param-table td {
    padding: 6px 8px;
  }
}
</style>
