import { createServerSupabaseClient } from "../../lib/supabase/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Database } from "../../lib/types";

type UserRoleRow = {
  role: Database["public"]["Tables"]["users"]["Row"]["role"];
};

export const metadata = {
  title: "Vasudha Admin",
};

type Props = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { data: user } = await (supabase as any)
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle();

  const role = (user as UserRoleRow | null)?.role ?? "user";

  if (!["admin", "owner"].includes(role)) {
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
