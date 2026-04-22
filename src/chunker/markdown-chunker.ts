import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import type { Chunk } from "./types.js";

interface HeadingPosition {
  heading: string;
  startOffset: number;
}

const MIN_WORD_COUNT = 30;

function countWords(text: string): number {
  const matches = text.match(/[a-zA-Z0-9가-힣_]+/g);
  return matches ? matches.length : 0;
}

export function chunkMarkdown(source: string, raw: string): Chunk[] {
  const tree = unified().use(remarkParse).parse(raw);

  const headings: HeadingPosition[] = [];

  visit(tree, "heading", (node) => {
    if (node.position) {
      const line = raw.slice(node.position.start.offset, node.position.end.offset);
      headings.push({
        heading: line.replace(/^#+\s*/, ""),
        startOffset: node.position.start.offset!,
      });
    }
  });

  // Split raw text by heading positions
  const rawChunks: { heading: string; content: string }[] = [];

  if (headings.length === 0) {
    rawChunks.push({ heading: "", content: raw });
  } else {
    // Content before first heading (if any)
    if (headings[0].startOffset > 0) {
      const beforeContent = raw.slice(0, headings[0].startOffset).trim();
      if (beforeContent) {
        rawChunks.push({ heading: "", content: beforeContent });
      }
    }

    for (let i = 0; i < headings.length; i++) {
      const start = headings[i].startOffset;
      const end = i + 1 < headings.length ? headings[i + 1].startOffset : raw.length;
      const content = raw.slice(start, end).trim();
      rawChunks.push({ heading: headings[i].heading, content });
    }
  }

  // Merge short chunks into previous
  const merged: { heading: string; content: string }[] = [];
  for (const chunk of rawChunks) {
    if (merged.length > 0 && countWords(chunk.content) < MIN_WORD_COUNT) {
      merged[merged.length - 1].content += "\n\n" + chunk.content;
    } else {
      merged.push({ ...chunk });
    }
  }

  return merged.map((chunk, index) => ({
    id: `${source}#${index}`,
    source,
    heading: chunk.heading,
    content: chunk.content,
    wordCount: countWords(chunk.content),
  }));
}
