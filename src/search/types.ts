import type { Chunk } from "../chunker/types.js";

export interface ScoredChunk {
  chunk: Chunk;
  score: number;
}
