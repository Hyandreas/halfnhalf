"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientSupabaseClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClientSupabaseClient();
    const { error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/studio");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1
          className="text-sm leading-loose mb-2"
          style={{ fontFamily: "var(--font-press-start)", color: "#4a3728" }}
        >
          half
          <br />
          nhalf
        </h1>
        <p className="text-brown-light text-sm">create your account ✦</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-cream border-2 border-tan/40 rounded-2xl p-6 flex flex-col gap-4"
        style={{ boxShadow: "4px 4px 0 #D4A574" }}
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-brown">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-2 border-tan/50 rounded-xl bg-cream text-brown px-3 py-2 text-sm focus:border-peach focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-brown">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="border-2 border-tan/50 rounded-xl bg-cream text-brown px-3 py-2 text-sm focus:border-peach focus:outline-none"
          />
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-peach border-2 border-tan text-brown font-bold rounded-xl py-2 text-sm hover:bg-tan hover:text-cream transition-colors disabled:opacity-50"
        >
          {loading ? "creating account…" : "create account"}
        </button>

        <p className="text-center text-xs text-brown-light">
          already have an account?{" "}
          <Link href="/sign-in" className="text-tan hover:text-peach font-semibold">
            sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
