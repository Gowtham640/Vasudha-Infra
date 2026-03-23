import "./globals.css";
import { Footer } from "../components/layout/Footer";
import { MobileBottomBar, MOBILE_BOTTOM_NAV_SPACER_CLASS } from "../components/layout/MobileBottomBar";
import { Navbar } from "../components/layout/Navbar";
import { FloatingActions } from "../components/layout/FloatingActions";
import { PageShell } from "../components/layout/PageShell";
import { I18nProvider } from "../components/i18n/I18nProvider";
import type { Metadata } from "next";
import { Inter, Sora, Open_Sans, Atkinson_Hyperlegible_Next, Playfair_Display, Montserrat, DM_Sans } from "next/font/google";

export const metadata: Metadata = {
  title: "Vasudha || Amaravati Real Estate",
  description:
    "Premium plots, layouts, and homes developed by Vasudha in Amaravati.",
};

// These pages use Supabase SSR which relies on `cookies()`.
// Force dynamic rendering so `next build` doesn't attempt static prerender.
export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" });
const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-atkinson",
});
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-hero" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-heading" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body" });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Intentionally no onboarding/profile logic here.

  return (
    <html lang="en">
      <body
        className={`bg-neutral-100 ${inter.variable} ${sora.variable} ${openSans.variable} ${atkinson.variable} ${playfair.variable} ${montserrat.variable} ${dmSans.variable}`}
      >
        <I18nProvider>
          <Navbar />
          <PageShell>{children}</PageShell>
          <Footer />
          {/* Reserves space above the fixed mobile tab bar so footer/content are not covered */}
          <div className={`${MOBILE_BOTTOM_NAV_SPACER_CLASS} shrink-0 lg:hidden`} aria-hidden />
          <MobileBottomBar />
          <FloatingActions />
        </I18nProvider>
      </body>
    </html>
  );
}

export { inter, sora, openSans, atkinson };