import { createServerSupabaseClient } from "../../../lib/supabase/client";

type AnalyticsLog = {
  event: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export default async function AdminAnalyticsPage() {
  const supabase = createServerSupabaseClient();
  const logsResponse = await supabase
    .from("logs")
    .select("event, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  const logs = (logsResponse.data ?? []) as AnalyticsLog[];

  return (
    <main className="pt-10 space-y-24">
      {/* pt-10 -> controls distance from navbar/top */}
      {/* space-y-24 -> controls spacing between sections (global layout control) */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-neutral-900">Analytics log</h2>
        <ul className="space-y-3 text-sm text-neutral-600">
          {/* Removed mt-4 -> vertical spacing now controlled by parent page (gives page full layout control) */}
          {logs.map((log) => (
            <li key={log.created_at}>
              <p className="font-medium text-neutral-900">{log.event ?? "event"}</p>
              <p className="text-xs text-neutral-400">{log.created_at}</p>
              {log.metadata && (
                <>
                  {/* Removed mt-2 -> vertical spacing now controlled by parent page (gives page full layout control) */}
                  <pre className="max-w-full whitespace-pre-wrap text-xs text-neutral-500">
                    {JSON.stringify(log.metadata)}
                  </pre>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
