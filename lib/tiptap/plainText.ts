import type { JSONContent } from "@tiptap/core";

function textFromNode(node: JSONContent): string {
  if (node.type === "text") {
    return node.text ?? "";
  }
  if (!node.content) {
    return "";
  }
  return node.content.map(textFromNode).join("");
}

/**
 * Pulls (H3 value, paragraph label) pairs for the about stats grid.
 */
export function extractHeadingParagraphPairs(
  doc: JSONContent,
  headingLevel: number
): Array<{ value: string; label: string }> {
  const pairs: Array<{ value: string; label: string }> = [];
  const content = doc.content ?? [];
  for (let i = 0; i < content.length - 1; i++) {
    const h = content[i];
    const p = content[i + 1];
    if (
      h?.type === "heading" &&
      h.attrs &&
      typeof h.attrs === "object" &&
      "level" in h.attrs &&
      (h.attrs as { level: number }).level === headingLevel &&
      p?.type === "paragraph"
    ) {
      pairs.push({
        value: textFromNode(h).trim(),
        label: textFromNode(p).trim(),
      });
    }
  }
  return pairs;
}
