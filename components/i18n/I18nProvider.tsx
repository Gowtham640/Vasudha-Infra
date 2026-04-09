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
    "common.contact_us": "Contact Us",
    "common.location": "Location",
    "common.apply": "Apply",
    "common.clear": "Clear",
    "common.loading_3d": "Loading 3D...",
    "common.interested_project": "Interested in this project?",
    "common.call_now": "Call Now",
    "common.whatsapp": "WhatsApp",
    "common.price_on_request": "Price on request",
    "common.amaravati": "Amaravati",
    "home.contact_prompt": "Call or message us to discuss available plots, layouts, and visits.",
    "home.whatsapp_label": "WhatsApp:",
    "projects.swipe": "Swipe",
    "projects.location_filter": "Location",
    "projects.available": "Available",
    "projects.layout": "Layout",
    "projects.amenities": "Amenities",
    "projects.nearby_landmarks": "Nearby Landmarks",
    "projects.payment_plans": "Payment Plans",
    "projects.prime_location": "Prime location",
    "projects.project_location": "Project Location",
    "projects.clubhouse": "Clubhouse",
    "projects.parks": "Parks",
    "projects.water_lines": "Water Lines",
    "projects.security": "24x7 Security",
    "projects.hospitals": "Hospitals",
    "projects.schools": "Schools",
    "projects.expressway": "Expressway",
    "projects.payment_plan_1": "40% on booking",
    "projects.payment_plan_2": "30% on foundation",
    "projects.payment_plan_3": "30% on possession",
    "about.vision_body":
      "We envision trsparent, technology-enabled land ownership where every family can confidently invest in growth corridors and future-ready communities.",
    "about.mission_body":
      "Our mission is to deliver legally verified projects, transparent payments, and dependable support from first enquiry to plot registration.",
    "about.contact_prompt": "Speak with our experts for availability, pricing, and guided visits.",
    "lead.name": "Name",
    "lead.email": "Email",
    "lead.phone": "Phone",
    "lead.message": "Message",
    "lead.compact_note": "We will contact you shortly.",
    "lead.full_note": "Our team will reach out within 24 hours.",
    "lead.sending": "Sending...",
    "lead.get_callback": "Get a callback",
    "lead.request_callback": "Request a callback",
    "lead.success": "Thank you! We will reach out shortly.",
    "lead.error": "Something went wrong. Please try again.",
    "contact.privacy_note": "Your information is safe with us. We do not spam.",
    "login.badge": "Authenticated Access",
    "login.title": "Sign in to the control room",
    "login.description":
      "Use your Google account to continue.",
    "login.button": "Sign in / Sign up with Google",
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
    "common.contact_us": "మమ్మల్ని సంప్రదించండి",
    "common.location": "ప్రాంతం",
    "common.apply": "వర్తింపజేయండి",
    "common.clear": "తొలగించండి",
    "common.loading_3d": "3D లోడ్ అవుతోంది...",
    "common.interested_project": "ఈ ప్రాజెక్ట్‌పై ఆసక్తి ఉందా?",
    "common.call_now": "ఇప్పుడే కాల్ చేయండి",
    "common.whatsapp": "వాట్సాప్",
    "common.price_on_request": "ధర కోసం సంప్రదించండి",
    "common.amaravati": "అమరావతి",
    "home.contact_prompt": "అందుబాటులో ఉన్న ప్లాట్లు, లేఅవుట్లు, సందర్శనల కోసం కాల్ చేయండి లేదా మెసేజ్ చేయండి.",
    "home.whatsapp_label": "వాట్సాప్:",
    "projects.swipe": "స్వైప్",
    "projects.location_filter": "ప్రాంతం",
    "projects.available": "అందుబాటులో ఉంది",
    "projects.layout": "లేఅవుట్",
    "projects.amenities": "సౌకర్యాలు",
    "projects.nearby_landmarks": "సమీప గుర్తింపు ప్రదేశాలు",
    "projects.payment_plans": "చెల్లింపు ప్రణాళికలు",
    "projects.prime_location": "అత్యుత్తమ ప్రదేశం",
    "projects.project_location": "ప్రాజెక్ట్ స్థానం",
    "projects.clubhouse": "క్లబ్ హౌస్",
    "projects.parks": "పార్కులు",
    "projects.water_lines": "నీటి లైన్లు",
    "projects.security": "24x7 భద్రత",
    "projects.hospitals": "ఆసుపత్రులు",
    "projects.schools": "పాఠశాలలు",
    "projects.expressway": "ఎక్స్‌ప్రెస్‌వే",
    "projects.payment_plan_1": "బుకింగ్ సమయంలో 40%",
    "projects.payment_plan_2": "ఫౌండేషన్ సమయంలో 30%",
    "projects.payment_plan_3": "పొజెషన్ సమయంలో 30%",
    "about.vision_body":
      "ప్రతి కుటుంబం అభివృద్ధి చెందుతున్న ప్రాంతాల్లో ధైర్యంగా పెట్టుబడి పెట్టగల పారదర్శక, సాంకేతిక ఆధారిత భూస్వామ్యాన్ని మేము లక్ష్యంగా పెట్టుకున్నాము.",
    "about.mission_body":
      "మొదటి విచారణ నుండి రిజిస్ట్రేషన్ వరకు చట్టబద్ధంగా ధృవీకరించిన ప్రాజెక్టులు, పారదర్శక చెల్లింపులు, నమ్మదగిన సహాయాన్ని అందించడం మా లక్ష్యం.",
    "about.contact_prompt": "అందుబాటు, ధరలు, మార్గదర్శక సందర్శనల కోసం మా నిపుణులతో మాట్లాడండి.",
    "lead.name": "పేరు",
    "lead.email": "ఇమెయిల్",
    "lead.phone": "ఫోన్",
    "lead.message": "సందేశం",
    "lead.compact_note": "త్వరలో మేము మీను సంప్రదిస్తాము.",
    "lead.full_note": "24 గంటల్లో మా బృందం స్పందిస్తుంది.",
    "lead.sending": "పంపిస్తున్నారు...",
    "lead.get_callback": "కాల్ బ్యాక్ పొందండి",
    "lead.request_callback": "కాల్ బ్యాక్ కోరండి",
    "lead.success": "ధన్యవాదాలు! త్వరలో మేము మీను సంప్రదిస్తాము.",
    "lead.error": "ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.",
    "contact.privacy_note": "మీ సమాచారం మా వద్ద భద్రంగా ఉంటుంది. మేము స్పామ్ చేయము.",
    "login.badge": "ప్రామాణీకరించిన ప్రాప్యత",
    "login.title": "కంట్రోల్ రూమ్‌లోకి సైన్ ఇన్ చేయండి",
    "login.description":
      "కొనసాగడానికి మీ గూగుల్ ఖాతాను ఉపయోగించండి. బ్రౌజర్లో క్రెడెన్షియల్స్ బహిర్గతం కాకుండా Supabase Auth సురక్షిత OAuth ప్రక్రియను నిర్వహిస్తుంది.",
    "login.button": "Google తో సైన్ ఇన్ / సైన్ అప్",
    "login.note":
      "సైన్ ఇన్ చేస్తే మీరు గూగుల్‌కు వెళ్లి ధృవీకరణ పూర్తయ్యాక ఆటోమేటిక్‌గా తిరిగి వస్తారు.",
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
