import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resolveNezoApiName, readDocument, listDocuments } from "../indexer/doc-registry.js";

const TOOL_NAME = "get-nezo-api-spec";

const TOOL_DESCRIPTION = `내죠여왕(NEZO) 알림톡 결제서비스 API의 전체 명세를 조회합니다.

요청/응답 파라미터, 예제 코드를 포함한 전체 문서를 반환합니다.
키워드 검색이 아닌 특정 API를 정확히 조회할 때 사용합니다.

사용 가능한 api_name:
send(결제요청), callback(콜백/리턴URL), search(결제조회),
cancel(결제취소), resend(재요청), start(시작하기),
mac(MAC검증가이드), 응답코드(response-codes), 방화벽(firewall)

보안 규칙:
1. svc_id와 MAC_KEY는 절대 클라이언트 코드에 포함 금지. 환경변수에서 로드.
2. HmacSHA256 MAC 생성/검증은 반드시 서버 사이드에서 처리.
3. callback_url 핸들러에 trade_no 기반 멱등성 로직 필수.
4. 테스트: test.mpps.co.kr / 운영: www.nezo.co.kr`;

const InputSchema = {
  api_name: z.string().describe("API 이름. 예: 'send', '결제요청', 'callback', 'mac', '시작하기'"),
};

export function registerGetNezoApiSpecTool(server: McpServer): void {
  server.tool(TOOL_NAME, TOOL_DESCRIPTION, InputSchema, async ({ api_name }) => {
    const path = resolveNezoApiName(api_name);

    if (!path) {
      const docs = listDocuments()
        .filter((d) => d.path.startsWith("nezo/"))
        .map((d) => `- ${d.title} (${d.path.replace("nezo/", "").replace(".md", "")})`)
        .join("\n");

      return {
        content: [{
          type: "text" as const,
          text: `'${api_name}'에 해당하는 내죠여왕 API를 찾을 수 없습니다.\n\n사용 가능한 문서:\n${docs}`,
        }],
      };
    }

    const content = await readDocument(path);
    return {
      content: [{
        type: "text" as const,
        text: `--- [${path}] 전체 명세 ---\n${content}`,
      }],
    };
  });
}
