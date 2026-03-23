"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Language = "en" | "te";

type I18nContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.projects": "Projects",
    "nav.about": "About Us",
    "nav.contact": "Contact",
    "nav.admin": "Admin",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "hero.title": "Your Dream Land Awaits",
    "hero.subtitle": "Discover premium open plots in prime locations with transparent pricing and clear titles.",
    "hero.cta": "Explore Projects",
    "hero.secondary": "Book a Visit",
    "featured.title": "Featured Projects",
    "featured.subtitle": "Handpicked premium plots for you",
    scroll: "Scroll",
    list: "List",
    "projects.title": "Our Projects",
    "projects.subtitle": "Explore premium land plots across top locations",
    "projects.filter": "Filter",
    "projects.view_details": "View Details",
    "about.title": "About Vasudha",
    "about.vision": "Our Vision",
    "about.mission": "Our Mission",
    "lead.title": "Book a Free Site Visit",
    "lead.subtitle": "Take the first step towards your dream land.",
  },
  te: {
    "nav.home": "హోమ్",
    "nav.projects": "ప్రాజెక్ట్‌లు",
    "nav.about": "మా గురించి",
    "nav.contact": "సంప్రదించండి",
    "nav.admin": "అడ్మిన్",
    "nav.login": "లాగిన్",
    "nav.logout": "లాగౌట్",
    "hero.title": "మీ కలల భూమి వేచి ఉంది",
    "hero.subtitle": "ప్రధాన ప్రదేశాలలో స్పష్టమైన ధరలతో ప్రీమియం ఓపెన్ ప్లాట్‌లను కనుగొనండి.",
    "hero.cta": "ప్రాజెక్ట్‌లు చూడండి",
    "hero.secondary": "సందర్శన బుక్ చేయండి",
    "featured.title": "ఫీచర్డ్ ప్రాజెక్ట్‌లు",
    "featured.subtitle": "మీ కోసం ఎంపిక చేసిన ప్రీమియం ప్లాట్‌లు",
    scroll: "స్క్రోల్",
    list: "జాబితా",
    "projects.title": "మా ప్రాజెక్ట్‌లు",
    "projects.subtitle": "అగ్ర ప్రదేశాలలో ప్రీమియం భూమి ప్లాట్‌లను అన్వేషించండి",
    "projects.filter": "ఫిల్టర్",
    "projects.view_details": "వివరాలు చూడండి",
    "about.title": "వసుధ గురించి",
    "about.vision": "మా దృష్టి",
    "about.mission": "మా లక్ష్యం",
    "lead.title": "ఉచిత సైట్ సందర్శన బుక్ చేయండి",
    "lead.subtitle": "మీ కలల భూమి వైపు మొదటి అడుగు వేయండి.",
  },
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem("vasudha_lang");
    return stored === "en" || stored === "te" ? stored : "en";
  });

  const setLang = (next: Language) => {
    setLangState(next);
    window.localStorage.setItem("vasudha_lang", next);
  };

  const t = useMemo(() => {
    return (key: string) => translations[lang][key] ?? key;
  }, [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
