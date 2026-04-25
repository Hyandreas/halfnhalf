"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createClientSupabaseClient } from "@/lib/supabase/client";

interface NavbarProps {
  plan?: "free" | "pro";
  role?: "user" | "admin";
}

export function Navbar({ plan = "free", role = "user" }: NavbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

          {/* Account dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="text-xs px-3 py-1.5 rounded-full border-2 border-tan/50 font-semibold text-brown-light hover:border-tan transition-colors flex items-center gap-1.5"
              aria-expanded={open}
            >
              account
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="currentColor"
                className={`transition-transform ${open ? "rotate-180" : ""}`}
              >
                <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {open && (
              <div
                className="absolute right-0 mt-2 w-44 rounded-xl border-2 border-tan/40 bg-cream warm-shadow py-1 flex flex-col"
                style={{ zIndex: 100 }}
              >
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-brown hover:bg-peach/20 transition-colors"
                >
                  settings
                </Link>

                {role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2.5 text-xs font-semibold transition-colors flex items-center gap-2"
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

                <div className="my-1 border-t border-tan/30" />

                <button
                  onClick={() => { setOpen(false); handleSignOut(); }}
                  className="px-4 py-2.5 text-xs font-semibold text-brown-light hover:bg-peach/20 transition-colors text-left"
                >
                  sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
