"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BarChart3, Users, FolderOpen, TrendingUp, Copy } from "lucide-react";

type LogItem = { event: string | null; created_at: string };
type LeadItem = { name: string | null; phone?: string | null; email?: string | null; created_at: string };
type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "owner" | null;
  created_at: string | null;
};

export function AdminDashboardClient({
  logs,
  leads,
  totalProjects,
  users,
  isOwner,
}: {
  logs: LogItem[];
  leads: LeadItem[];
  totalProjects: number;
  users: UserItem[];
  isOwner: boolean;
}) {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userRows, setUserRows] = useState<UserItem[]>(users);
  const [roleUpdateState, setRoleUpdateState] = useState<{ type: "idle" | "saving" | "error"; message?: string }>({
    type: "idle",
  });

  const filteredLeads = useMemo(() => {
    const maxItems = range === "7d" ? 20 : range === "30d" ? 80 : 200;
    return leads.slice(0, maxItems);
  }, [leads, range]);

  const copyLead = async (lead: LeadItem) => {
  const text = `Name: ${lead.name ?? ""}
  Phone: ${lead.phone ?? ""}
  Email: ${lead.email ?? ""}`;
    await navigator.clipboard.writeText(text);
  };

  const updateUserRole = async (userId: string, role: "admin" | "user") => {
    setRoleUpdateState({ type: "saving" });
    const response = await fetch("/api/admin/users/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setRoleUpdateState({
        type: "error",
        message: body.error ?? "Failed to update role.",
      });
      return;
    }

    setUserRows((previousRows) =>
      previousRows.map((row) => (row.id === userId ? { ...row, role } : row))
    );
    setEditingUserId(null);
    setRoleUpdateState({ type: "idle" });
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
          <h2 className="font-heading text-lg font-semibold text-neutral-900">Project Sections</h2>
          <p className="text-sm text-neutral-500 mt-2">Select home projects and manage project order for the projects page.</p>
          <div className="mt-4">
            <Link href="/admin/sections" className="inline-flex rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white">Manage Project Sections</Link>
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

      {isOwner ? (
        <section className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <h2 className="font-heading font-semibold text-neutral-900">Users</h2>
            <p className="mt-1 text-xs text-neutral-500">Owner-only role management for all user records.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {userRows.map((row) => (
                  <tr key={row.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors duration-200">
                    <td className="p-4">{row.name}</td>
                    <td className="p-4">{row.email}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-800">
                          {row.role ?? "user"}
                        </span>
                        {row.role === "owner" ? null : (
                          <button
                            onClick={() =>
                              setEditingUserId((currentEditingId) => (currentEditingId === row.id ? null : row.id))
                            }
                            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-700 transition-all duration-200 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-neutral-900"
                          >
                            Edit
                          </button>
                        )}
                        {editingUserId === row.id ? (
                          <select
                            className="rounded-md border border-neutral-300 bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-emerald-300 transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                            value={row.role === "admin" ? "admin" : "user"}
                            onChange={(event) => {
                              const nextRole = event.target.value as "admin" | "user";
                              void updateUserRole(row.id, nextRole);
                            }}
                          >
                            <option value="admin">admin</option>
                            <option value="user">user</option>
                          </select>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-4">
                      {row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {roleUpdateState.type === "error" ? (
            <p className="border-t border-neutral-200 px-4 py-3 text-xs text-red-600">{roleUpdateState.message}</p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
