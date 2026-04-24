"use client";

import { useEffect, useState, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AD_DURATION_SECONDS } from "@/lib/constants";

interface AdBreakModalProps {
  open: boolean;
  issuedAt: string | null;   // ISO string from server — drives the countdown
  onVerify: () => Promise<boolean>;
  onSuccess: () => void;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdBreakModal({ open, issuedAt, onVerify, onSuccess }: AdBreakModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION_SECONDS);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recalculate seconds left from server-issued timestamp
  useEffect(() => {
    if (!open || !issuedAt) return;

    const issued = new Date(issuedAt).getTime();

    const tick = () => {
      const elapsed = (Date.now() - issued) / 1000;
      const left = Math.max(0, AD_DURATION_SECONDS - elapsed);
      setSecondsLeft(Math.ceil(left));
    };

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [open, issuedAt]);

  // Push AdSense unit when modal opens
  useEffect(() => {
    if (!open) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded — graceful no-op
    }
  }, [open]);

  const handleExport = useCallback(async () => {
    setVerifying(true);
    setError(null);
    try {
      const ok = await onVerify();
      if (ok) {
        onSuccess();
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg.includes("425") ? "Please wait for the countdown." : msg);
    } finally {
      setVerifying(false);
    }
  }, [onVerify, onSuccess]);

  const adsDone = secondsLeft === 0;

  return (
    <Modal open={open} className="max-w-lg">
      <div className="p-6 flex flex-col gap-5">
        <div className="text-center">
          <p
            className="text-[9px] mb-1 opacity-50"
            style={{ fontFamily: "var(--font-press-start)" }}
          >
            FREE PLAN
          </p>
          <h2
            className="text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-press-start)", color: "#4a3728" }}
          >
            quick ad break
          </h2>
          <p className="text-xs text-brown-light mt-2">
            your video will be ready in just a moment ✦
          </p>
        </div>

        {/* AdSense unit */}
        <div
          className="adsense-container rounded-xl border-2 border-tan/20 bg-cream overflow-hidden"
          style={{ minHeight: 250 }}
        >
          {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ? (
            <ins
              className="adsbygoogle"
              style={{ display: "block", width: "100%", height: "250px" }}
              data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
              data-ad-slot="auto"
              data-ad-format="rectangle"
              data-full-width-responsive="false"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-brown-light opacity-40">
              ad space
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className="flex flex-col items-center gap-2">
          {!adsDone ? (
            <>
              <div
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-press-start)", color: "#D4A574" }}
              >
                {secondsLeft}
              </div>
              <p className="text-xs text-brown-light">seconds remaining</p>
            </>
          ) : (
            <p className="text-xs text-sage font-bold">✓ ad complete</p>
          )}
        </div>

        {error && (
          <p className="text-xs text-center" style={{ color: "#E8A598" }}>
            {error}
          </p>
        )}

        <Button
          onClick={handleExport}
          disabled={!adsDone || verifying}
          size="lg"
          className="w-full"
        >
          {verifying ? "verifying..." : adsDone ? "export now →" : `wait ${secondsLeft}s`}
        </Button>

        <p className="text-[10px] text-center text-brown-light opacity-50">
          upgrade to Pro to skip ads and export unlimited videos
        </p>
      </div>
    </Modal>
  );
}
