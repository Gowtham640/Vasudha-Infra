"use client";

import { useI18n } from "../i18n/I18nProvider";

type LoginContentProps = {
  signInAction: () => Promise<void>;
};

export function LoginContent({ signInAction }: LoginContentProps) {
  const { t } = useI18n();

  return (
    <div className="glass-panel w-full max-w-xl rounded-3xl p-10 text-center shadow-xl">
      <div className="flex flex-col gap-4">
        <p className="text-sm uppercase tracking-[0.4em] text-neutral-500">{t("login.badge")}</p>
        <h1 className="text-4xl font-semibold text-emerald-900">{t("login.title")}</h1>
        <p className="text-base text-neutral-600">{t("login.description")}</p>
      </div>

      <form action={signInAction} className="flex flex-col rounded-4xl bg-green-900 gap-4">
        <button
          type="submit"
          className="bg-green-700 rounded-2xl inline-flex items-center justify-center gap-2 w-full px-6 py-3 text-base font-semibold uppercase tracking-[0.2em]"
        >
          {t("login")}
        </button>
      </form>
    </div>
  );
}
