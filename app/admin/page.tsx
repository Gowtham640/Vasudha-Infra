import {
  createServerComponentSupabaseClient,
} from "../../lib/supabase/server";

type AdminLog = {
  event: string | null;
  created_at: string;
};
type AdminLead = {
  name: string | null;
  created_at: string;
};

export default async function AdminDashboardPage() {
  // Fix: Cookies can only be modified in a Server Action or Route Handler.
  // Server Component: read-only Supabase client (no cookie writes during render).
  const supabase = createServerComponentSupabaseClient();
  const logsResponse = await supabase.from("logs").select("event, created_at").order("created_at", { ascending: false }).limit(5);
  const leadsResponse = await supabase.from("leads").select("name, created_at").order("created_at", { ascending: false }).limit(5);

  const logs = (logsResponse.data ?? []) as AdminLog[];
  const leads = (leadsResponse.data ?? []) as AdminLead[];

  return (
    <main className="pt-10 space-y-24">
      {/* pt-10 -> controls distance from navbar/top */}
      {/* space-y-24 -> controls spacing between sections (global layout control) */}
      <div className="flex flex-col gap-6">
        {/* Removed space-y-6 -> vertical spacing now controlled by parent page (gives page full layout control) */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="text-sm uppercase tracking-[0.4em] text-neutral-500">Latest logs</p>
            <ul className="space-y-3 text-sm text-neutral-600">
              {/* Removed mt-4 -> vertical spacing now controlled by parent page (gives page full layout control) */}
              {logs.map((log) => (
                <li key={log.created_at}>
                  <p className="text-neutral-900">{log.event ?? "event"}</p>
                  <p className="text-xs text-neutral-400">{log.created_at}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="text-sm uppercase tracking-[0.4em] text-neutral-500">New leads</p>
            <ul className="space-y-3 text-sm text-neutral-600">
              {/* Removed mt-4 -> vertical spacing now controlled by parent page (gives page full layout control) */}
              {leads.map((lead) => (
                <li key={lead.created_at}>
                  <p className="text-neutral-900">{lead.name ?? "anonymous"}</p>
                  <p className="text-xs text-neutral-400">{lead.created_at}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
          <p>Use the sections tab to update hero copy, reasons to choose us, and contact CTAs.</p>
        </div>
      </div>
    </main>
  );
}
