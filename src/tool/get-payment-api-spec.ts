import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { resolvePaymentApiName, readDocument, listDocuments } from "../indexer/doc-registry.js";

const TOOL_NAME = "get-payment-api-spec";

const TOOL_DESCRIPTION = `MOBILPAY REST API의 전체 명세를 조회합니다.

요청/응답 파라미터, 예제 코드를 포함한 전체 문서를 반환합니다.
키워드 검색이 아닌 특정 API를 정확히 조회할 때 사용합니다.

사용 가능한 api_name:
registration(거래등록), payment-window(결제창), auth-response(인증응답),
approval-tid(결제승인), purchase(수동매입), virtual-account(가상계좌),
cancellation(결제취소), refund(환불), escrow-delivery(에스크로 배송등록),
cash-receipt(현금영수증), hmac(HMAC검증)

보안 규칙:
1. skey(서비스키)는 절대 클라이언트 코드에 포함 금지. 환경변수에서 로드.
2. HMAC 무결성 검증은 반드시 서버 사이드에서 처리.
3. 결제 승인 API(/MUP/api/approval)는 반드시 백엔드에서 호출.`;

const InputSchema = {
  api_name: z.string().describe("API 이름. 예: 'registration', '거래등록', 'cancellation', '결제취소', 'escrow-delivery'"),
};

export function registerGetPaymentApiSpecTool(server: McpServer): void {
  server.tool(TOOL_NAME, TOOL_DESCRIPTION, InputSchema, async ({ api_name }) => {
    const path = resolvePaymentApiName(api_name);

    if (!path) {
      const docs = listDocuments()
        .filter((d) => d.path.startsWith("payment/"))
        .map((d) => `- ${d.title} (${d.path.replace("payment/", "").replace(/\/(.*?)\.md$/, "/$1")})`)
        .join("\n");

      return {
        content: [{
          type: "text" as const,
          text: `'${api_name}'에 해당하는 MOBILPAY API를 찾을 수 없습니다.\n\n사용 가능한 API:\n${docs}`,
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
