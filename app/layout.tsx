import "./globals.css";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { FloatingActions } from "../components/layout/FloatingActions";
import { PageShell } from "../components/layout/PageShell";
import type { Metadata } from "next";
import { Inter, Sora, Open_Sans, Atkinson_Hyperlegible_Next } from "next/font/google";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Intentionally no onboarding/profile logic here.

  return (
    <html lang="en">
      <body
        className={`bg-neutral-100 ${inter.variable} ${sora.variable} ${openSans.variable} ${atkinson.variable}`}
      >
        <Navbar />
        <PageShell>{children}</PageShell>
        <Footer />
        <FloatingActions />
      </body>
    </html>
  );
}

export { inter, sora, openSans, atkinson };