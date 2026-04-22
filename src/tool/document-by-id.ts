import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getDocumentById, readDocument, listDocuments } from "../indexer/doc-registry.js";

const TOOL_NAME = "document-by-id";

const TOOL_DESCRIPTION = `문서 ID로 KG파이낸셜 결제서비스 연동 문서 전체를 조회합니다. (MOBILPAY REST API + 내죠여왕 알림톡 결제)

get-docs 검색 결과에서 특정 문서의 전체 내용이 필요할 때 사용합니다.
ID 목록은 이 Tool을 id=0으로 호출하면 확인할 수 있습니다.`;

const InputSchema = {
  id: z.number().describe("문서 ID. 0을 입력하면 전체 문서 목록을 반환합니다."),
};

export function registerDocumentByIdTool(server: McpServer): void {
  server.tool(TOOL_NAME, TOOL_DESCRIPTION, InputSchema, async ({ id }) => {
    // id=0: return document list
    if (id === 0) {
      const docs = listDocuments();
      const list = docs
        .map((d) => `${d.id}. [${d.title}] ${d.description}`)
        .join("\n");

      return {
        content: [{
          type: "text" as const,
          text: `KG파이낸셜 문서 목록 (총 ${docs.length}개):\n\n${list}`,
        }],
      };
    }

    const entry = getDocumentById(id);
    if (!entry) {
      const docs = listDocuments();
      return {
        content: [{
          type: "text" as const,
          text: `ID ${id}에 해당하는 문서가 없습니다. 유효한 ID: 1~${docs.length}`,
        }],
      };
    }

    const content = await readDocument(entry.path);
    return {
      content: [{
        type: "text" as const,
        text: `--- [ID:${entry.id}] ${entry.title} (${entry.path}) ---\n${content}`,
      }],
    };
  });
}
