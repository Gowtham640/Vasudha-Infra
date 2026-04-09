import type { JSONContent } from "@tiptap/core";

const ALLOWED_NODE_TYPES = new Set([
  "doc",
  "paragraph",
  "heading",
  "text",
  "hardBreak",
]);

function stripMarksFromTextNode(node: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = { type: "text" };
  if (typeof node.text === "string") {
    next.text = node.text;
  }
  return next;
}

function normalizeContentArray(content: unknown): unknown[] | undefined {
  if (!Array.isArray(content)) {
    return undefined;
  }
  return content.map((child) => normalizeNode(child)).filter((c) => c !== null) as unknown[];
}

/** Flattens legacy bold/italic marks so stored JSON stays content-only. */
function normalizeNode(node: unknown): unknown {
  if (!node || typeof node !== "object") {
    return null;
  }
  const n = node as Record<string, unknown>;
  const type = n.type;
  if (typeof type !== "string") {
    return null;
  }
  if (type === "doc") {
    const content = normalizeContentArray(n.content);
    return content ? { type: "doc", content } : { type: "doc", content: [] };
  }
  if (type === "paragraph") {
    const content = normalizeContentArray(n.content);
    return content && content.length ? { type: "paragraph", content } : { type: "paragraph" };
  }
  if (type === "heading") {
    const attrs = n.attrs;
    const content = normalizeContentArray(n.content);
    const base: Record<string, unknown> = { type: "heading" };
    if (attrs && typeof attrs === "object") {
      base.attrs = attrs;
    }
    if (content && content.length) {
      base.content = content;
    }
    return base;
  }
  if (type === "text") {
    return stripMarksFromTextNode(n);
  }
  if (type === "hardBreak") {
    return { type: "hardBreak" };
  }
  return null;
}

function validateNode(node: unknown, depth: number): boolean {
  if (depth > 50) {
    return false;
  }
  if (!node || typeof node !== "object") {
    return false;
  }
  const n = node as Record<string, unknown>;
  const type = n.type;
  if (typeof type !== "string" || !ALLOWED_NODE_TYPES.has(type)) {
    return false;
  }
  if (type === "doc") {
    if (!Array.isArray(n.content)) {
      return true;
    }
    return n.content.every((child) => validateNode(child, depth + 1));
  }
  if (type === "paragraph") {
    if (!n.content) {
      return true;
    }
    if (!Array.isArray(n.content)) {
      return false;
    }
    return n.content.every((child) => validateNode(child, depth + 1));
  }
  if (type === "heading") {
    const attrs = n.attrs as { level?: number } | undefined;
    const level = attrs?.level;
    if (typeof level !== "number" || level < 1 || level > 3) {
      return false;
    }
    if (!n.content) {
      return true;
    }
    if (!Array.isArray(n.content)) {
      return false;
    }
    return n.content.every((child) => validateNode(child, depth + 1));
  }
  if (type === "text") {
    const marks = n.marks;
    if (marks !== undefined) {
      if (!Array.isArray(marks) || marks.length > 0) {
        return false;
      }
    }
    return typeof n.text === "string" || n.text === undefined;
  }
  if (type === "hardBreak") {
    return true;
  }
  return false;
}

export const emptyCmsDoc: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function parseCmsTiptapDoc(value: unknown): {
  ok: true;
  doc: JSONContent;
} {
  const stripped = normalizeNode(value);
  if (stripped && validateNode(stripped, 0)) {
    return { ok: true, doc: stripped as JSONContent };
  }
  return { ok: true, doc: emptyCmsDoc };
}

export function assertValidCmsTiptapDoc(value: unknown): JSONContent {
  const stripped = normalizeNode(value);
  if (!stripped || !validateNode(stripped, 0)) {
    throw new Error("Invalid Tiptap document for CMS");
  }
  return stripped as JSONContent;
}
