"use client";

import { useI18n } from "../i18n/I18nProvider";

export function ContactPrivacyNote() {
  const { t } = useI18n();
  return <p className="mt-6 text-center text-xs text-neutral-500">{t("contact.privacy_note")}</p>;
}
