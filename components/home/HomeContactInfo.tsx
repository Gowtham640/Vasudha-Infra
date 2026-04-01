"use client";

import { useI18n } from "../i18n/I18nProvider";

export function HomeContactInfo() {
  const { t } = useI18n();

  return (
    <div className="text-white py-1 md:py-3">
      <h3 className="font-heading text-xl md:text-2xl">{t("common.contact_us")}</h3>
      <p className="mt-2 text-white/90 text-sm md:text-base">{t("home.contact_prompt")}</p>
      <div className="mt-4 space-y-2 text-sm md:text-base">
        <a href="tel:+919999999999" className="block underline-offset-2 hover:underline">
          +91 99999 99999
        </a>
        <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="block underline-offset-2 hover:underline">
          {t("home.whatsapp_label")} +91 99999 99999
        </a>
        <a href="mailto:hello@vasudhaproperties.com" className="block underline-offset-2 hover:underline">
          hello@vasudhaproperties.com
        </a>
      </div>
    </div>
  );
}
