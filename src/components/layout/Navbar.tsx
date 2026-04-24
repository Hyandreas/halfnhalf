"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";

interface NavbarProps {
  plan?: "free" | "pro";
}

export function Navbar({ plan = "free" }: NavbarProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClientSupabaseClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b-2 border-tan/30"
      style={{ backgroundColor: "#FFF8F0" }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/halfnhalf.png" alt="halfnhalf" width={32} height={32} className="rounded-lg" />
        </Link>

        <div className="flex items-center gap-3">
          {plan === "free" ? (
            <Link
              href="/billing"
              className="text-xs px-3 py-1.5 rounded-full border-2 border-peach font-semibold transition-colors hover:bg-peach/20"
              style={{ color: "#D4A574" }}
            >
              upgrade →
            </Link>
          ) : (
            <span
              className="text-xs px-3 py-1 rounded-full font-bold"
              style={{ backgroundColor: "#A8C5A0", color: "#FFF8F0" }}
            >
              PRO ✦
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="text-xs px-3 py-1.5 rounded-full border-2 border-tan/50 font-semibold text-brown-light hover:border-tan transition-colors"
          >
            sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
