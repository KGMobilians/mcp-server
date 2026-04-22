import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { search } from "../indexer/doc-indexer.js";

const TOOL_NAME = "get-docs";

const TOOL_DESCRIPTION = `KG파이낸셜 결제서비스 연동 문서를 검색합니다. (MOBILPAY REST API + 내죠여왕 알림톡 결제)

지원 문서:
[MOBILPAY] 거래등록, 결제창 호출, 인증/승인 응답, 결제승인(TID/MOBILID), 수동매입,
가상계좌, 결제취소, 환불, 현금영수증, HMAC 무결성 검증, 결제플로우(일반/하이브리드),
noti_url 처리, 방화벽 설정, 에러코드표, 결제수단/카드사/금융기관 코드표
[내죠여왕] 결제요청(/send), 콜백/리턴URL, 결제조회(/send/view), 결제취소(/cancel),
결제재요청, MAC 생성/검증, 응답코드, 방화벽 설정

보안 규칙 (생성 코드에 반드시 준수):
[MOBILPAY]
1. skey(서비스키)는 절대 클라이언트 코드에 포함 금지. 환경변수에서 로드.
2. HMAC 무결성 검증은 반드시 서버 사이드에서 처리.
3. noti_url 처리 시 중복 거래 방어 로직(tid 기반 멱등성) 필수.
4. 결제 승인 API(/MUP/api/approval)는 반드시 백엔드에서 호출.
5. 테스트: test.mobilians.co.kr / 운영: mup.mobilians.co.kr
[내죠여왕]
1. svc_id와 MAC_KEY는 절대 클라이언트 코드에 포함 금지. 환경변수에서 로드.
2. HmacSHA256 MAC 생성/검증은 반드시 서버 사이드에서 처리.
3. callback_url 처리 시 중복 거래 방어 로직(trade_no 기반 멱등성) 필수.
4. 테스트: test.mpps.co.kr / 운영: www.nezo.co.kr`;

const InputSchema = {
  keywords: z.array(z.string()).describe("검색 키워드 배열. 예: [\"거래등록\", \"sid\"] 또는 [\"알림톡\", \"결제요청\"]"),
};

export function registerGetDocsTool(server: McpServer): void {
  server.tool(TOOL_NAME, TOOL_DESCRIPTION, InputSchema, async ({ keywords }) => {
    const results = search(keywords);

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "검색 결과가 없습니다. 다른 키워드로 시도해 주세요.",
          },
        ],
      };
    }

    const text = results
      .map((r) => {
        const header = `--- [${r.chunk.source}] ${r.chunk.heading} (score: ${r.score.toFixed(2)}) ---`;
        return `${header}\n${r.chunk.content}`;
      })
      .join("\n\n");

    return {
      content: [
        {
          type: "text" as const,
          text,
        },
      ],
    };
  });
}
