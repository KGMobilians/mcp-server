import { describe, it, expect } from "vitest";
import { chunkMarkdown } from "./markdown-chunker.js";

describe("chunkMarkdown", () => {
  it("빈 입력은 빈 콘텐츠 청크 반환", () => {
    const result = chunkMarkdown("test.md", "");
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe("");
  });

  it("헤딩 없는 문서는 하나의 청크 반환", () => {
    const raw = "이것은 헤딩이 없는 일반 텍스트 문서입니다. 충분히 긴 내용이 있어야 합니다.";
    const result = chunkMarkdown("test.md", raw);
    expect(result).toHaveLength(1);
    expect(result[0].heading).toBe("");
    expect(result[0].source).toBe("test.md");
  });

  it("여러 헤딩으로 올바르게 분할 (충분히 긴 청크)", () => {
    const longText = "결제 연동 가이드 문서를 작성합니다. 거래등록 API를 호출하고 결과를 처리합니다. " +
      "파라미터는 sid cash_code product_name trade_id site_url ok_url amount 입니다. " +
      "응답으로 pay_url tid hmac code message를 받습니다. 테스트서버와 운영서버를 구분하여 사용합니다.";

    const raw = `# 첫 번째 섹션

${longText}

## 두 번째 섹션

${longText}`;

    const result = chunkMarkdown("test.md", raw);
    expect(result).toHaveLength(2);
    expect(result[0].heading).toBe("첫 번째 섹션");
    expect(result[1].heading).toBe("두 번째 섹션");
  });

  it("30단어 미만 짧은 청크는 이전 청크에 병합", () => {
    const longText = "결제 연동에 필요한 파라미터를 설명합니다. 거래등록 요청 시 필수 파라미터는 sid cash_code product_name trade_id site_url ok_url 입니다. " +
      "응답으로 pay_url tid hmac을 받습니다.";

    const raw = `# 메인 섹션

${longText}

## 짧은 섹션

짧은 내용`;

    const result = chunkMarkdown("test.md", raw);
    expect(result).toHaveLength(1);
    expect(result[0].content).toContain("짧은 내용");
  });

  it("테이블이 동일 섹션에 유지됨", () => {
    const raw = `# API 파라미터

거래등록 API의 요청 파라미터입니다. 결제수단에 관계없이 반드시 전달해야 하는 공통 파라미터를 설명합니다.

| 필드 | 타입 | 설명 |
|------|------|------|
| sid | string | 가맹점 코드 |
| cash_code | string | 결제수단 코드 |
| product_name | string | 상품명 |
| trade_id | string | 거래번호 |

## 다음 섹션

다음 섹션의 내용입니다. 결제창을 호출하기 위해 pay_url을 사용합니다. 팝업 또는 iframe 방식으로 호출합니다. 결제수단에 따라 크기가 다릅니다. 신용카드 PC WEB은 820x600입니다.`;

    const result = chunkMarkdown("test.md", raw);
    expect(result[0].content).toContain("| sid |");
    expect(result[0].content).toContain("| cash_code |");
  });

  it("코드블록이 동일 섹션에 유지됨", () => {
    const raw = `# 요청 예제

다음은 거래등록 요청 예제입니다. JSON 형식으로 POST 전송합니다. Content-Type은 application/json으로 설정합니다.

\`\`\`json
{
  "sid": "000730010001",
  "cash_code": "MC",
  "product_name": "테스트상품"
}
\`\`\`

## 응답 예제

다음은 거래등록 응답 예제입니다. 성공시 code 0000이 반환됩니다. pay_url을 사용하여 결제창을 호출합니다. tid는 이후 승인에 사용됩니다.`;

    const result = chunkMarkdown("test.md", raw);
    expect(result[0].content).toContain('"sid": "000730010001"');
  });

  it("source와 id 메타데이터가 올바름", () => {
    const result = chunkMarkdown("api/registration.md", "일반 텍스트 문서 내용");
    expect(result[0].source).toBe("api/registration.md");
    expect(result[0].id).toBe("api/registration.md#0");
  });
});
