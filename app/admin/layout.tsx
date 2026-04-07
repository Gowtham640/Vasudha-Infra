import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createServerComponentSupabaseClient } from "../../lib/supabase/server";
import { AdminSectionNav } from "../../components/admin/AdminSectionNav";

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
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-neutral-100">
      <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 px-4 py-6">
        <AdminSectionNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}