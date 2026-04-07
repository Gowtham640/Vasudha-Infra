"use client";

import { useI18n } from "../i18n/I18nProvider";

export function HomeContactInfo() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center py-1 text-center text-neutral-900 md:py-3">
      <h3 className="font-heading text-xl font-semibold md:text-2xl">{t("common.contact_us")}</h3>
      <p className="mt-2 max-w-sm text-sm text-neutral-900 md:text-base font-heading">{t("home.contact_prompt")}</p>
      <div className="mt-4 w-full space-y-2 text-center text-sm md:text-base">
        <a href="tel:+917416264646" className="block font-heading underline-offset-2 hover:underline">
          +91 7416 264 646
        </a>
        <a
          href="https://wa.me/917416264646"
          target="_blank"
          rel="noopener noreferrer"
          className="block font-heading underline-offset-2 hover:underline"
        >
          {t("home.whatsapp_label")} +91 7416 264 646
        </a>
        <a
          href="mailto:hello@vasudhaproperties.com"
          className="block font-heading text-[12px] underline-offset-2 hover:underline"
        >
          hello@vasudhaproperties.com
        </a>
      </div>
    </div>
  );
}
