import type { Chunk } from "../chunker/types.js";
import type { ScoredChunk } from "./types.js";

const K1 = 1.2;
const B = 0.75;
const TOKEN_RE = /[a-zA-Z0-9가-힣_]+/g;

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(TOKEN_RE) ?? []);
}

interface DocEntry {
  chunk: Chunk;
  tokens: string[];
  termFreq: Map<string, number>;
}

export class BM25Index {
  private docs: DocEntry[] = [];
  private invertedIndex = new Map<string, Set<number>>();
  private avgDocLen = 0;

  build(chunks: Chunk[]): void {
    this.docs = [];
    this.invertedIndex.clear();

    for (let i = 0; i < chunks.length; i++) {
      const tokens = tokenize(chunks[i].content);
      const termFreq = new Map<string, number>();
      for (const t of tokens) {
        termFreq.set(t, (termFreq.get(t) ?? 0) + 1);
      }

      this.docs.push({ chunk: chunks[i], tokens, termFreq });

      for (const term of termFreq.keys()) {
        if (!this.invertedIndex.has(term)) {
          this.invertedIndex.set(term, new Set());
        }
        this.invertedIndex.get(term)!.add(i);
      }
    }

    const totalLen = this.docs.reduce((sum, d) => sum + d.tokens.length, 0);
    this.avgDocLen = this.docs.length > 0 ? totalLen / this.docs.length : 0;
  }

  search(keywords: string[], topK = 15, window = 1): ScoredChunk[] {
    const queryTokens = keywords.flatMap((kw) => tokenize(kw));
    if (queryTokens.length === 0) return [];

    const N = this.docs.length;
    const scores = new Float64Array(N);

    for (const qt of queryTokens) {
      const postings = this.invertedIndex.get(qt);
      if (!postings) continue;

      const df = postings.size;
      const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);

      for (const docIdx of postings) {
        const doc = this.docs[docIdx];
        const tf = doc.termFreq.get(qt) ?? 0;
        const docLen = doc.tokens.length;
        const tfNorm = (tf * (K1 + 1)) / (tf + K1 * (1 - B + B * (docLen / this.avgDocLen)));
        scores[docIdx] += idf * tfNorm;
      }
    }

    // Get top-K indices
    const indexed = Array.from(scores)
      .map((score, idx) => ({ score, idx }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    if (indexed.length === 0) return [];

    // Filter low-relevance results (below 30% of top score)
    const maxScore = indexed[0].score;
    const filtered = indexed.filter((x) => x.score >= maxScore * 0.3);

    // Expand with adjacent window chunks (same source only), deduplicate
    const resultSet = new Set<number>();
    for (const { idx } of filtered) {
      resultSet.add(idx);
      const source = this.docs[idx].chunk.source;
      for (let w = -window; w <= window; w++) {
        if (w === 0) continue;
        const neighbor = idx + w;
        if (neighbor >= 0 && neighbor < N && this.docs[neighbor].chunk.source === source) {
          resultSet.add(neighbor);
        }
      }
    }

    // Return sorted by original document order for readability
    return Array.from(resultSet)
      .sort((a, b) => a - b)
      .map((idx) => ({
        chunk: this.docs[idx].chunk,
        score: scores[idx],
      }));
  }
}
