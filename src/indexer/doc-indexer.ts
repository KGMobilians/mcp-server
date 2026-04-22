import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chunkMarkdown } from "../chunker/markdown-chunker.js";
import { BM25Index } from "../search/bm25.js";
import { buildRegistry } from "./doc-registry.js";
import type { Chunk } from "../chunker/types.js";
import type { ScoredChunk } from "../search/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MD_DIR = join(__dirname, "..", "..", "md");

let index: BM25Index | null = null;
let allChunks: Chunk[] = [];

export async function buildIndex(): Promise<void> {
  // Build document registry from llms.txt
  await buildRegistry();

  // Build BM25 search index from all md files
  const files = await readdir(MD_DIR, { recursive: true });
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  allChunks = [];
  for (const file of mdFiles) {
    const raw = await readFile(join(MD_DIR, file), "utf-8");
    const chunks = chunkMarkdown(file, raw);
    allChunks.push(...chunks);
  }

  index = new BM25Index();
  index.build(allChunks);
}

export function search(keywords: string[], topK = 15, window = 1): ScoredChunk[] {
  if (!index) {
    throw new Error("Index not built. Call buildIndex() first.");
  }
  return index.search(keywords, topK, window);
}
