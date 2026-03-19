import "./globals.css";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { FloatingActions } from "../components/layout/FloatingActions";
import { PageShell } from "../components/layout/PageShell";
import { createServerSupabaseClient } from "../lib/supabase/client";
import { ensurePublicUser } from "../lib/supabase/helpers";
import { Inter, Sora, Open_Sans, Atkinson_Hyperlegible_Next } from "next/font/google";

export const metadata = {
  title: "Vasudha || Amaravati Real Estate",
  description:
    "Premium plots, layouts, and homes developed by Vasudha in Amaravati. Explore fixed content pages powered by Supabase.",
};
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-atkinson",
});
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    await ensurePublicUser(supabase, session.user);
  }

  return (
    <html lang="en">
      <body className="bg-neutral-100 `${inter.variable} ${sora.variable} ${openSans.variable} ${atkinson.variable}`">
        <Navbar />
        <PageShell>{children}</PageShell>
        <Footer />
        <FloatingActions />
      </body>
    </html>
  );
}
export { inter, sora, openSans, atkinson };