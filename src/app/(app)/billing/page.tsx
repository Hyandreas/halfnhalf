"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export default function BillingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const success = params.get("success");
  const canceled = params.get("canceled");

  const [plan, setPlan] = useState<"free" | "pro" | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/billing/create-portal", { method: "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    // Detect plan from URL after Stripe redirect
    if (success) {
      setPlan("pro");
    } else {
      // Fetch current plan from studio page's data source
      setPlan("free"); // will be set by server correctly in real scenario
    }
  }, [success]);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/create-checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/create-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col gap-8">
      <div className="text-center">
        <h1
          className="text-xs leading-loose"
          style={{ fontFamily: "var(--font-press-start)", color: "#4a3728" }}
        >
          billing
        </h1>
      </div>

      {success && (
        <Card className="border-sage bg-sage/10 text-center">
          <p className="font-bold text-brown">✦ welcome to Pro!</p>
          <p className="text-sm text-brown-light mt-1">
            you now have unlimited exports and no ads.
          </p>
          <button
            onClick={() => router.push("/studio")}
            className="text-xs text-tan hover:text-peach font-semibold mt-3 block mx-auto"
          >
            go to studio →
          </button>
        </Card>
      )}

      {canceled && (
        <Card className="border-rose/40 text-center">
          <p className="text-sm text-brown-light">
            no worries — you can upgrade anytime.
          </p>
        </Card>
      )}

      {/* Plan comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Free */}
        <Card elevated>
          <div className="flex flex-col gap-4">
            <div>
              <p
                className="text-[9px] mb-1"
                style={{ fontFamily: "var(--font-press-start)", color: "#D4A574" }}
              >
                FREE
              </p>
              <p
                className="text-lg font-bold"
                style={{ color: "#4a3728" }}
              >
                $0 / mo
              </p>
            </div>
            <ul className="flex flex-col gap-2 text-sm text-brown-light">
              <li>✓ 5 exports per week</li>
              <li>✓ upload your own clips</li>
              <li>✓ 1080×1920 MP4 output</li>
              <li className="opacity-50">✗ 20s ad before each export</li>
              <li className="opacity-50">✗ creator clip search</li>
            </ul>
          </div>
        </Card>

        {/* Pro */}
        <Card elevated className="border-peach/60 bg-peach/5 relative">
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-bold text-cream"
            style={{
              fontFamily: "var(--font-press-start)",
              backgroundColor: "#D4A574",
            }}
          >
            PRO
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <p
                className="text-[9px] mb-1"
                style={{ fontFamily: "var(--font-press-start)", color: "#D4A574" }}
              >
                PRO
              </p>
              <p
                className="text-lg font-bold"
                style={{ color: "#4a3728" }}
              >
                $9.99 / mo
              </p>
            </div>
            <ul className="flex flex-col gap-2 text-sm text-brown-light">
              <li className="font-semibold text-brown">✦ unlimited exports</li>
              <li className="font-semibold text-brown">✦ no ad break</li>
              <li>✓ upload your own clips</li>
              <li>✓ 1080×1920 MP4 output</li>
              <li className="font-semibold text-brown">✦ search any creator on TikTok, Instagram &amp; YouTube</li>
            </ul>
            <Button
              onClick={plan === "pro" ? handleManage : handleUpgrade}
              disabled={loading}
              className="w-full mt-2"
            >
              {loading ? (
                <Spinner size={16} />
              ) : plan === "pro" ? (
                "manage subscription"
              ) : (
                "upgrade to pro →"
              )}
            </Button>
          </div>
        </Card>
      </div>

      <p className="text-xs text-center text-brown-light opacity-60">
        cancel anytime. no questions asked.
      </p>
    </div>
  );
}
