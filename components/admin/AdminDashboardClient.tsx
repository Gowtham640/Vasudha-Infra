"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BarChart3, Users, FolderOpen, TrendingUp, Copy } from "lucide-react";

type LogItem = { event: string | null; created_at: string };
type LeadItem = { name: string | null; phone?: string | null; email?: string | null; created_at: string };

export function AdminDashboardClient({
  logs,
  leads,
  totalProjects,
}: {
  logs: LogItem[];
  leads: LeadItem[];
  totalProjects: number;
}) {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");

  const filteredLeads = useMemo(() => {
    const maxItems = range === "7d" ? 20 : range === "30d" ? 80 : 200;
    return leads.slice(0, maxItems);
  }, [leads, range]);

  const copyLead = async (lead: LeadItem) => {
    const text = `${lead.name ?? ""} | ${lead.phone ?? ""} | ${lead.email ?? ""} | ${lead.created_at}`;
    await navigator.clipboard.writeText(text);
  };

  const stats = [
    { label: "Total Leads", value: String(leads.length), icon: Users },
    { label: "Total Projects", value: String(totalProjects), icon: FolderOpen },
    { label: "Filtered Leads", value: String(filteredLeads.length), icon: TrendingUp },
    { label: "Recent Logs", value: String(logs.length), icon: BarChart3 },
  ];

  return (
    <main className="space-y-10">
      <section className="py-2">
        <h1 className="font-hero text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
        <div className="mt-5 flex gap-2">
          {(["7d", "30d", "90d"] as const).map((option) => (
            <button key={option} onClick={() => setRange(option)} className={`px-4 py-2 rounded-full text-sm ${range === option ? "bg-green-700 text-white" : "bg-neutral-100 text-neutral-700"}`}>
              {option}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-card">
              <div className="flex items-center justify-between">
                <Icon className="w-5 h-5 text-green-700" />
              </div>
              <p className="font-heading text-2xl font-bold text-neutral-900 mt-2">{stat.value}</p>
              <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="font-heading text-lg font-semibold text-neutral-900">Manage Projects</h2>
          <p className="text-sm text-neutral-500 mt-2">Use the existing project add/edit modal and ordering controls.</p>
          <div className="mt-4">
            <Link href="/admin/projects" className="inline-flex rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white">Open Projects</Link>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="font-heading text-lg font-semibold text-neutral-900">Edit Sections</h2>
          <p className="text-sm text-neutral-500 mt-2">Keep the current editable section flow for homepage and contact blocks.</p>
          <div className="mt-4">
            <Link href="/admin/sections" className="inline-flex rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white">Open Sections</Link>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="font-heading font-semibold text-neutral-900">Leads</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Copy</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, index) => (
                <tr key={`${lead.created_at}-${index}`} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="p-4">{lead.name ?? "anonymous"}</td>
                  <td className="p-4">{lead.phone ?? "-"}</td>
                  <td className="p-4">{lead.email ?? "-"}</td>
                  <td className="p-4">{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <button onClick={() => copyLead(lead)} className="inline-flex items-center gap-1 rounded-md border border-neutral-300 px-3 py-1.5 text-xs">
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
