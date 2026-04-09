import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import HardBreak from "@tiptap/extension-hard-break";
import History from "@tiptap/extension-history";
import Placeholder from "@tiptap/extension-placeholder";

/**
 * CMS extensions: structure only (paragraph, headings for legacy/about_stats, hard breaks).
 * Bold/Italic intentionally omitted — admins edit copy only, not inline styling.
 */
export function getCmsHtmlExtensions() {
  return [
    Document,
    Paragraph,
    Text,
    Heading.configure({ levels: [1, 2, 3] }),
    HardBreak,
    History,
  ];
}

export function getCmsEditorExtensions(placeholder?: string) {
  return [
    ...getCmsHtmlExtensions(),
    Placeholder.configure({
      placeholder: placeholder ?? "Start writing…",
    }),
  ];
}
