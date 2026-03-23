import {
  createServerComponentSupabaseClient,
} from "../../lib/supabase/server";
import { AdminDashboardClient } from "../../components/admin/AdminDashboardClient";

type AdminLog = {
  event: string | null;
  created_at: string;
};
type AdminLead = {
  name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
};

export default async function AdminDashboardPage() {
  // Fix: Cookies can only be modified in a Server Action or Route Handler.
  // Server Component: read-only Supabase client (no cookie writes during render).
  const supabase = createServerComponentSupabaseClient();
  const logsResponse = await supabase.from("logs").select("event, created_at").order("created_at", { ascending: false }).limit(40);
  const leadsResponse = await supabase.from("leads").select("name, phone, email, created_at").order("created_at", { ascending: false }).limit(200);
  const projectsResponse = await supabase.from("projects").select("id", { count: "exact", head: true });

  const logs = (logsResponse.data ?? []) as AdminLog[];
  const leads = (leadsResponse.data ?? []) as AdminLead[];

  return (
    <AdminDashboardClient
      logs={logs}
      leads={leads}
      totalProjects={projectsResponse.count ?? 0}
    />
  );
}
