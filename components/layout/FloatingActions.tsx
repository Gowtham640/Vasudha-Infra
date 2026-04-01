"use client";

import { Phone } from "lucide-react";
import { useI18n } from "../i18n/I18nProvider";

export function FloatingActions() {
  const { t } = useI18n();
  return (
    <div className="pointer-events-none fixed z-100 right-6 top-[70vh] flex flex-col gap-3">
      <a
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_20px_45px_rgba(37,211,102,0.35)] transition-opacity duration-200 hover:opacity-90"
        href="https://wa.me/919999999999"
        target="_blank"
        rel="noreferrer"
        aria-label={t("common.whatsapp")}
        style={{ animation: "airFloat 3.8s ease-in-out infinite" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-7 w-7 fill-current"
        >
          <path d="M19.11 4.93A10.05 10.05 0 0 0 12.02 2C6.49 2 2 6.48 2 12a9.93 9.93 0 0 0 1.35 5.02L2 22l5.11-1.32a10.04 10.04 0 0 0 4.91 1.26h.01C17.53 21.94 22 17.46 22 12a9.95 9.95 0 0 0-2.89-7.07zm-7.08 15.32h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.03.78.81-2.96-.2-.31A8.2 8.2 0 0 1 3.8 12c0-4.54 3.69-8.23 8.23-8.23a8.17 8.17 0 0 1 5.82 2.41A8.17 8.17 0 0 1 20.25 12c0 4.54-3.69 8.23-8.22 8.25zm4.51-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.98-.15.17-.29.19-.54.06-.25-.12-1.04-.38-1.99-1.22-.74-.66-1.25-1.48-1.39-1.73-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.76-1.86-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.41 1.01 2.58.12.17 1.76 2.69 4.27 3.77.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29z" />
        </svg>
      </a>
      <a
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-900 shadow-lg shadow-neutral-300 transition-colors duration-200 hover:border-(--brand-primary)"
        href="tel:+917416264646"
        aria-label={t("common.call_now")}
        style={{ animation: "airFloat 4.4s ease-in-out infinite 0.45s" }}
      >
        <Phone className="h-6 w-6" />
      </a>
    </div>
  );
}
