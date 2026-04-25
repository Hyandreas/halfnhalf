"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";

interface HomeAccountMenuProps {
  role: "user" | "admin";
}

export function HomeAccountMenu({ role }: HomeAccountMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClientSupabaseClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-semibold flex items-center gap-1.5 transition-colors"
        style={{ color: "#7a5c47" }}
        aria-expanded={open}
      >
        account
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-44 rounded-xl border-2 py-1 flex flex-col"
          style={{
            backgroundColor: "#FFF8F0",
            borderColor: "rgba(212,165,116,0.4)",
            boxShadow: "2px 2px 0px #D4A574",
            zIndex: 100,
          }}
        >
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-peach/20"
            style={{ color: "#4a3728" }}
          >
            settings
          </Link>

          {role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-peach/20 flex items-center gap-2"
              style={{ color: "#133B8B" }}
            >
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                style={{ background: "#C8D6F5", color: "#133B8B" }}
              >
                ADMIN
              </span>
              dashboard
            </Link>
          )}

          <div className="my-1 border-t" style={{ borderColor: "rgba(212,165,116,0.3)" }} />

          <button
            onClick={() => { setOpen(false); handleSignOut(); }}
            className="px-4 py-2.5 text-xs font-semibold text-left transition-colors hover:bg-peach/20"
            style={{ color: "#7a5c47" }}
          >
            sign out
          </button>
        </div>
      )}
    </div>
  );
}
