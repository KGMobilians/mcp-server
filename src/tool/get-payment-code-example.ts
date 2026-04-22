import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resolvePaymentApiName, readDocument, listDocuments } from "../indexer/doc-registry.js";

const TOOL_NAME = "get-payment-code-example";

const TOOL_DESCRIPTION = `MOBILPAY REST API의 언어별 예제 코드를 조회합니다.

문서에 포함된 코드 블록을 언어 필터링하여 반환합니다.
HMAC 검증 문서에는 Java, C#, Node.js, Python, PHP 예제가 포함되어 있습니다.

보안 규칙:
1. skey는 환경변수에서 로드. 절대 클라이언트 코드에 포함 금지.
2. HMAC 검증, 결제 승인은 반드시 서버 사이드에서 처리.`;

const InputSchema = {
  api_name: z.string().describe("API 이름. 예: 'registration', 'hmac', 'approval-tid', 'noti-url'"),
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

export function registerGetPaymentCodeExampleTool(server: McpServer): void {
  server.tool(TOOL_NAME, TOOL_DESCRIPTION, InputSchema, async ({ api_name, language }) => {
    const path = resolvePaymentApiName(api_name);

    if (!path) {
      const docs = listDocuments()
        .filter((d) => d.path.startsWith("payment/"))
        .map((d) => `- ${d.title} (${d.path.replace("payment/", "").replace(".md", "")})`)
        .join("\n");

      return {
        content: [{
          type: "text" as const,
          text: `'${api_name}'에 해당하는 MOBILPAY 문서를 찾을 수 없습니다.\n\n사용 가능한 문서:\n${docs}`,
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
