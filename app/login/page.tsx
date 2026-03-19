import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase/client";

// Server action to start the Supabase OAuth handshake safely on the server.
const signInWithGoogle = async () => {
  "use server";
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
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
        <div className="glass-panel w-full max-w-xl rounded-3xl p-10 text-center shadow-xl">
          <div className="flex flex-col gap-4">
            <p className="text-sm uppercase tracking-[0.4em] text-neutral-500">Authenticated Access</p>
            {/* Removed mt-4 -> vertical spacing now controlled by parent page (gives page full layout control) */}
            <h1 className="text-4xl font-semibold text-emerald-900">Sign in to the control room</h1>
            {/* Removed mt-3 -> vertical spacing now controlled by parent page (gives page full layout control) */}
            <p className="text-base text-neutral-600">
              Use your Google account to continue. We rely on Supabase Auth to handle the secure OAuth handshake
              without exposing credentials on the browser.
            </p>
          </div>

          {/* Submit to the server action so Supabase returns the Google redirect URL. */}
          <form action={signInWithGoogle} method="post" className="flex flex-col gap-4">
          {/* Removed mt-10 -> vertical spacing now controlled by parent page (gives page full layout control) */}
            <button
              type="submit"
              className="primary-button inline-flex items-center justify-center gap-2 w-full px-6 py-3 text-base font-semibold uppercase tracking-[0.2em]"
            >
              Continue with Google
            </button>
          </form>

          {/* Removed mt-6 -> vertical spacing now controlled by parent page (gives page full layout control) */}
          <p className="text-sm text-neutral-500">
            Signing in will redirect you to Google for authentication and bring you back automatically once approved.
          </p>
        </div>
      </section>
    </main>
  );
}
