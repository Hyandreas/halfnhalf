"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

interface AccountSettingsProps {
  email: string;
  plan: "free" | "pro";
  role: "user" | "admin";
  createdAt: string;
}

export function AccountSettings({ email, plan, role, createdAt }: AccountSettingsProps) {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwMessage(null);
    if (newPassword !== confirmPassword) {
      setPwMessage({ text: "passwords do not match", ok: false });
      return;
    }
    if (newPassword.length < 8) {
      setPwMessage({ text: "password must be at least 8 characters", ok: false });
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update password");
      setPwMessage({ text: "password updated successfully", ok: true });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setPwMessage({ text: e instanceof Error ? e.message : "Failed to update password", ok: false });
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== email) return;
    setDeleteError(null);
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/settings/delete-account", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete account");
      router.push("/");
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Failed to delete account");
      setDeleteLoading(false);
    }
  }

  const joinDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col gap-8">
      <div className="text-center">
        <h1
          className="text-xs leading-loose"
          style={{ fontFamily: "var(--font-press-start)", color: "#4a3728" }}
        >
          settings
        </h1>
      </div>

      {/* Account info */}
      <Card elevated>
        <h2 className="text-sm font-bold text-brown mb-4">account</h2>
        <div className="flex flex-col gap-3 text-sm text-brown-light">
          <div className="flex items-center justify-between">
            <span>email</span>
            <span className="font-semibold text-brown">{email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>plan</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: plan === "pro" ? "#F5D6C8" : "#EDE6D6",
                color: plan === "pro" ? "#8B4513" : "#7a6652",
              }}
            >
              {plan}
            </span>
          </div>
          {role === "admin" && (
            <div className="flex items-center justify-between">
              <span>role</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#C8D6F5", color: "#133B8B" }}
              >
                admin
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>member since</span>
            <span className="font-semibold text-brown">{joinDate}</span>
          </div>
        </div>

        {plan === "free" && (
          <div className="mt-4 pt-4 border-t border-tan/30">
            <a
              href="/billing"
              className="text-xs font-semibold transition-colors hover:opacity-80"
              style={{ color: "#D4A574" }}
            >
              upgrade to Pro →
            </a>
          </div>
        )}
      </Card>

      {/* Change password */}
      <Card elevated>
        <h2 className="text-sm font-bold text-brown mb-4">change password</h2>
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-brown-light font-semibold">current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="px-3 py-2 rounded-lg border-2 border-tan/40 bg-cream text-sm text-brown outline-none focus:border-peach transition-colors"
              autoComplete="current-password"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-brown-light font-semibold">new password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="px-3 py-2 rounded-lg border-2 border-tan/40 bg-cream text-sm text-brown outline-none focus:border-peach transition-colors"
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-brown-light font-semibold">confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="px-3 py-2 rounded-lg border-2 border-tan/40 bg-cream text-sm text-brown outline-none focus:border-peach transition-colors"
              autoComplete="new-password"
            />
          </div>

          {pwMessage && (
            <p
              className="text-xs font-semibold"
              style={{ color: pwMessage.ok ? "#A8C5A0" : "#E8A598" }}
            >
              {pwMessage.text}
            </p>
          )}

          <Button type="submit" disabled={pwLoading} className="self-start mt-1">
            {pwLoading ? <Spinner size={16} /> : "update password"}
          </Button>
        </form>
      </Card>

      {/* Danger zone */}
      <Card className="border-rose/40">
        <h2 className="text-sm font-bold mb-1" style={{ color: "#c0392b" }}>
          danger zone
        </h2>
        <p className="text-xs text-brown-light mb-4">
          permanently delete your account and all associated data. this cannot be undone.
        </p>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-brown-light font-semibold">
            type your email to confirm: <span className="text-brown">{email}</span>
          </label>
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={email}
            className="px-3 py-2 rounded-lg border-2 border-rose/30 bg-cream text-sm text-brown outline-none focus:border-rose transition-colors"
          />
          {deleteError && (
            <p className="text-xs font-semibold" style={{ color: "#E8A598" }}>
              {deleteError}
            </p>
          )}
          <Button
            variant="danger"
            disabled={deleteConfirm !== email || deleteLoading}
            onClick={handleDeleteAccount}
            className="self-start mt-1"
          >
            {deleteLoading ? <Spinner size={16} /> : "delete account"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
