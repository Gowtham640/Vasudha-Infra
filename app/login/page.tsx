import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { LoginContent } from "../../components/auth/LoginContent";

const buildAuthCallbackRedirect = () => {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  // Supabase OAuth callback handler exchanges the `code` for a session.
  return `${base}/auth/callback`;
};

// Server action to start the Supabase OAuth handshake safely on the server.
const signInWithGoogle = async () => {
  "use server";
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: buildAuthCallbackRedirect(),
    },
  });

  if (error) {
    console.error("Unable to initiate Google sign-in process", error);
    return;
  }

  if (!data?.url) {
    console.error("Supabase did not return a redirect URL for Google login");
    redirect("/");
    return;
  }

  // Forward the browser to Supabase so the OAuth dance continues on Google.
  redirect(data.url);
};

export default function LoginPage() {
  return (
    <main className="pt-10 space-y-24">
      {/* pt-10 -> controls distance from navbar/top */}
      {/* space-y-24 -> controls spacing between sections (global layout control) */}
      <section className="flex flex-1 items-center justify-center px-4">
        {/* Removed py-12 -> vertical spacing now controlled by parent page (gives page full layout control) */}
        <LoginContent signInAction={signInWithGoogle} />
      </section>
    </main>
  );
}
