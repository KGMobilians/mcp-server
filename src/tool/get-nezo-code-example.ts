import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resolveNezoApiName, readDocument, listDocuments } from "../indexer/doc-registry.js";

const TOOL_NAME = "get-nezo-code-example";

const TOOL_DESCRIPTION = `내죠여왕(NEZO) 알림톡 결제서비스의 언어별 예제 코드를 조회합니다.

문서에 포함된 코드 블록을 언어 필터링하여 반환합니다.
MAC 가이드 문서에 Java, C#, Node.js, Python, PHP 예제가 포함되어 있습니다.

보안 규칙:
1. svc_id와 MAC_KEY는 환경변수에서 로드. 절대 클라이언트 코드에 포함 금지.
2. MAC 생성/검증은 반드시 서버 사이드에서 처리.`;

const InputSchema = {
  api_name: z.string().describe("API 이름. 예: 'send', 'callback', 'mac', 'cancel'"),
  language: z.string().optional().describe("프로그래밍 언어 필터. 예: 'java', 'python', 'node', 'php', 'csharp'"),
};

const LANG_ALIASES: Record<string, string[]> = {
  java: ["java"],
  javascript: ["javascript", "js", "node", "nodejs", "node.js", "express"],
  python: ["python", "py", "flask", "django"],
  php: ["php", "laravel"],
  csharp: ["csharp", "c#", ".net", "cs"],
};

function matchLanguage(codeBlockLang: string, filterLang: string): boolean {
  const normalizedFilter = filterLang.toLowerCase();
  for (const [, aliases] of Object.entries(LANG_ALIASES)) {
    if (aliases.includes(normalizedFilter)) {
      return aliases.some((a) => codeBlockLang.toLowerCase().includes(a));
    }
  }
  return codeBlockLang.toLowerCase().includes(normalizedFilter);
}

function extractCodeBlocks(markdown: string, language?: string): string[] {
  const codeBlockRe = /```(\w*)\n([\s\S]*?)```/g;
  const blocks: string[] = [];

  let match;
  while ((match = codeBlockRe.exec(markdown)) !== null) {
    const [fullMatch, lang] = match;
    if (!language || matchLanguage(lang, language)) {
      blocks.push(fullMatch);
    }
  }
  return blocks;
}

export function registerGetNezoCodeExampleTool(server: McpServer): void {
  server.tool(TOOL_NAME, TOOL_DESCRIPTION, InputSchema, async ({ api_name, language }) => {
    const path = resolveNezoApiName(api_name);

    if (!path) {
      const docs = listDocuments()
        .filter((d) => d.path.startsWith("nezo/"))
        .map((d) => `- ${d.title} (${d.path.replace("nezo/", "").replace(".md", "")})`)
        .join("\n");

      return {
        content: [{
          type: "text" as const,
          text: `'${api_name}'에 해당하는 내죠여왕 문서를 찾을 수 없습니다.\n\n사용 가능한 문서:\n${docs}`,
        }],
      };
    }

    const content = await readDocument(path);
    const blocks = extractCodeBlocks(content, language);

    if (blocks.length === 0) {
      const allBlocks = extractCodeBlocks(content);
      if (allBlocks.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: `${path} 문서에 코드 예제가 없습니다.`,
          }],
        };
      }

      const langs = new Set<string>();
      const langRe = /```(\w+)/g;
      let m;
      while ((m = langRe.exec(content)) !== null) {
        if (m[1]) langs.add(m[1]);
      }

      return {
        content: [{
          type: "text" as const,
          text: `${path} 문서에 '${language}' 언어 예제가 없습니다.\n사용 가능한 언어: ${[...langs].join(", ")}`,
        }],
      };
    }

    const text = `--- [${path}] ${language ? language + " " : ""}코드 예제 (${blocks.length}개) ---\n\n${blocks.join("\n\n")}`;

    return {
      content: [{
        type: "text" as const,
        text,
      }],
    };
  });
}
