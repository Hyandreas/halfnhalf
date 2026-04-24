"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface AdminUser {
  id: string;
  email: string;
  plan: "free" | "pro";
  role: "user" | "admin";
  created_at: string;
  weekly_exports: number;
}

interface Stats {
  total_users: number;
  pro_users: number;
  total_exports: number;
}

interface AdminDashboardProps {
  initialUsers: AdminUser[];
  initialStats: Stats;
  currentAdminId: string;
}

export function AdminDashboard({ initialUsers, initialStats, currentAdminId }: AdminDashboardProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function patch(userId: string, field: "plan" | "role", value: string) {
    const key = `${userId}-${field}`;
    setLoading(key);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, field, value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Update failed");
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, [field]: value } : u))
      );
      setStats((prev) => ({
        ...prev,
        pro_users: field === "plan"
          ? prev.pro_users + (value === "pro" ? 1 : -1)
          : prev.pro_users,
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="text-center mb-2">
        <h1
          className="text-xs leading-loose"
          style={{ fontFamily: "var(--font-press-start)", color: "#4a3728" }}
        >
          admin
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-brown">{stats.total_users}</p>
          <p className="text-xs text-brown-light mt-1">total users</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-brown">{stats.pro_users}</p>
          <p className="text-xs text-brown-light mt-1">pro users</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-brown">{stats.total_exports}</p>
          <p className="text-xs text-brown-light mt-1">total exports</p>
        </Card>
      </div>

      {error && (
        <p className="text-sm text-center" style={{ color: "#E8A598" }}>
          {error}
        </p>
      )}

      {/* Users table */}
      <Card elevated>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-tan/30">
                <th className="text-left py-2 pr-4 text-xs text-brown-light font-semibold">email</th>
                <th className="text-left py-2 pr-4 text-xs text-brown-light font-semibold">plan</th>
                <th className="text-left py-2 pr-4 text-xs text-brown-light font-semibold">role</th>
                <th className="text-left py-2 pr-4 text-xs text-brown-light font-semibold">exports (week)</th>
                <th className="text-left py-2 text-xs text-brown-light font-semibold">actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-tan/20 last:border-0">
                  <td className="py-3 pr-4 text-brown">
                    {user.email}
                    {user.id === currentAdminId && (
                      <span className="ml-2 text-xs text-peach font-bold">(you)</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: user.plan === "pro" ? "#F5D6C8" : "#EDE6D6",
                        color: user.plan === "pro" ? "#8B4513" : "#7a6652",
                      }}
                    >
                      {user.plan}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: user.role === "admin" ? "#C8D6F5" : "#EDE6D6",
                        color: user.role === "admin" ? "#133B8B" : "#7a6652",
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-brown">{user.weekly_exports}</td>
                  <td className="py-3">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={loading !== null}
                        onClick={() => patch(user.id, "plan", user.plan === "pro" ? "free" : "pro")}
                      >
                        {loading === `${user.id}-plan`
                          ? "..."
                          : user.plan === "pro"
                          ? "→ free"
                          : "→ pro"}
                      </Button>
                      <Button
                        size="sm"
                        variant={user.role === "admin" ? "danger" : "ghost"}
                        disabled={loading !== null || (user.id === currentAdminId && user.role === "admin")}
                        onClick={() => patch(user.id, "role", user.role === "admin" ? "user" : "admin")}
                      >
                        {loading === `${user.id}-role`
                          ? "..."
                          : user.role === "admin"
                          ? "remove admin"
                          : "make admin"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
