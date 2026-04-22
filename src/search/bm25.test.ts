import { describe, it, expect } from "vitest";
import { BM25Index } from "./bm25.js";
import type { Chunk } from "../chunker/types.js";

function makeChunk(id: string, source: string, content: string): Chunk {
  return {
    id,
    source,
    heading: id,
    content,
    wordCount: content.split(/\s+/).length,
  };
}

describe("BM25Index", () => {
  it("빈 인덱스는 빈 결과 반환", () => {
    const index = new BM25Index();
    index.build([]);
    expect(index.search(["거래등록"])).toEqual([]);
  });

  it("키워드 매칭 시 score > 0", () => {
    const index = new BM25Index();
    index.build([makeChunk("c1", "a.md", "거래등록 API를 호출합니다")]);
    const results = index.search(["거래등록"]);
    expect(results).toHaveLength(1);
    expect(results[0].score).toBeGreaterThan(0);
  });

  it("정확한 키워드가 높은 점수", () => {
    const index = new BM25Index();
    index.build([
      makeChunk("c1", "a.md", "거래등록 API 파라미터 sid cash_code 거래등록"),
      makeChunk("c2", "b.md", "결제창 호출 방법 popup iframe self"),
    ]);
    const results = index.search(["거래등록"]);
    const c1 = results.find((r) => r.chunk.id === "c1");
    const c2 = results.find((r) => r.chunk.id === "c2");
    expect(c1).toBeDefined();
    expect(c1!.score).toBeGreaterThan(0);
    // c2는 매칭되지 않으므로 결과에 없거나 score가 0
    if (c2) {
      expect(c2.score).toBe(0);
    }
  });

  it("topK가 결과 수를 제한", () => {
    const index = new BM25Index();
    const chunks = Array.from({ length: 30 }, (_, i) =>
      makeChunk(`c${i}`, `file${i}.md`, `결제 문서 섹션 ${i} 거래등록 파라미터 설명`)
    );
    index.build(chunks);
    const results = index.search(["결제"], 5, 0);
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it("윈도우 확장은 동일 소스만 포함", () => {
    const index = new BM25Index();
    index.build([
      makeChunk("c0", "a.md", "첫 번째 문서의 일반 내용 파라미터 설명"),
      makeChunk("c1", "a.md", "거래등록 API sid cash_code 거래등록"),
      makeChunk("c2", "b.md", "다른 문서의 내용 결제창 호출 방법"),
    ]);
    const results = index.search(["거래등록"], 15, 1);
    const sources = results.map((r) => r.chunk.source);
    expect(sources).toContain("a.md");
    expect(sources).not.toContain("b.md");
  });

  it("낮은 점수 결과는 필터링", () => {
    const index = new BM25Index();
    index.build([
      makeChunk("c0", "a.md", "거래등록 거래등록 거래등록 API sid 파라미터"),
      makeChunk("c1", "b.md", "완전히 다른 주제의 문서 방화벽 설정 IP 목록"),
    ]);
    const results = index.search(["거래등록"]);
    const ids = results.map((r) => r.chunk.id);
    expect(ids).toContain("c0");
    expect(ids).not.toContain("c1");
  });

  it("결제연동 + 내죠여왕 통합 인덱스에서 서비스별 검색", () => {
    const index = new BM25Index();
    index.build([
      makeChunk("p1", "payment/api/registration.md", "거래등록 API sid cash_code 결제창 호출을 위한 거래정보 등록"),
      makeChunk("p2", "payment/api/cancel.md", "결제취소 API cancel_type 전체취소 부분취소 처리"),
      makeChunk("n1", "nezo/api/send.md", "알림톡 결제요청 API svc_id recv_hp 카카오 알림톡 결제 요청"),
      makeChunk("n2", "nezo/api/cancel.md", "내죠여왕 결제취소 API svc_id pay_no trade_no 취소"),
    ]);

    // 결제연동 키워드 → payment 문서 우선
    const payResults = index.search(["거래등록", "sid"]);
    expect(payResults.length).toBeGreaterThan(0);
    expect(payResults[0].chunk.source).toContain("payment/");

    // 내죠여왕 키워드 → nezo 문서 우선
    const nezoResults = index.search(["알림톡", "결제요청"]);
    expect(nezoResults.length).toBeGreaterThan(0);
    expect(nezoResults[0].chunk.source).toContain("nezo/");
  });
});
