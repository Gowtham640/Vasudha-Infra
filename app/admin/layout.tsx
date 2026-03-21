import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createServerComponentSupabaseClient } from "../../lib/supabase/server";

export const metadata: Metadata = {
  title: "Vasudha Admin",
};

// These admin routes rely on Supabase SSR which uses `cookies`.
// Force dynamic rendering so `next build` doesn't try to prerender statically.
export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  // Fix: Cookies can only be modified in a Server Action or Route Handler.
  // This is a Server Component, so use the read-only Supabase client.
  const supabase = createServerComponentSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Use the same DB functions your RLS policies are built on.
  // This avoids failing role reads due to RLS on `public.users`.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  const { data: role, error } = await supabase.rpc("get_my_role");

if (error || !role) {
  console.error("Failed to fetch role", error);
  redirect("/");
}

if (role !== "admin" && role !== "owner") {
  redirect("/");
}

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-6 py-4 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-neutral-500">Admin Control</p>
            <h1 className="text-xl font-semibold text-neutral-900">Vasudha Panel</h1>
          </div>
          <div className="flex gap-4 text-sm text-neutral-500">
            <Link href="/admin/projects">Projects</Link>
            <Link href="/admin/sections">Sections</Link>
            <Link href="/admin/analytics">Analytics</Link>
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}