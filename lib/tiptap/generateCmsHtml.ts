import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import { getCmsHtmlExtensions } from "./cmsExtensions";
import { emptyCmsDoc, parseCmsTiptapDoc } from "./cmsDoc";

const extensions = getCmsHtmlExtensions();

export function generateCmsHtmlFromJson(json: unknown): string {
  const { doc } = parseCmsTiptapDoc(json);
  const safe: JSONContent = doc ?? emptyCmsDoc;
  try {
    return generateHTML(safe, extensions);
  } catch (error) {
    console.error("generateCmsHtmlFromJson", error);
    return generateHTML(emptyCmsDoc, extensions);
  }
}
