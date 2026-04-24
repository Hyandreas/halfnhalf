"use client";

import { useState, useCallback } from "react";
import { ExportTokenResponse } from "@/types/api";

export type ExportFlowState =
  | "idle"
  | "requesting-token"
  | "ad-break"
  | "encoding"
  | "done"
  | "error";

export function useExportFlow() {
  const [state, setState] = useState<ExportFlowState>("idle");
  const [token, setToken] = useState<string | null>(null);
  const [issuedAt, setIssuedAt] = useState<string | null>(null);
  const [skipAd, setSkipAd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clipNames, setClipNames] = useState<{ top: string; bottom: string }>({
    top: "clip",
    bottom: "clip",
  });

  const requestToken = useCallback(
    async (clipTopName: string, clipBottomName: string) => {
      setState("requesting-token");
      setError(null);
      try {
        const res = await fetch("/api/export-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clipTopName, clipBottomName }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          if (res.status === 429) throw new Error("Weekly export limit reached.");
          throw new Error(err.error ?? "Could not start export");
        }
        const data: ExportTokenResponse = await res.json();
        setToken(data.token);
        setIssuedAt(data.issuedAt);
        setSkipAd(data.skipAd);
        setClipNames({ top: clipTopName, bottom: clipBottomName });

        if (data.skipAd) {
          // Pro users skip straight to encoding signal
          return { skipAd: true, token: data.token };
        } else {
          setState("ad-break");
          return { skipAd: false, token: data.token };
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Export failed";
        setError(msg);
        setState("error");
        throw e;
      }
    },
    []
  );

  const verifyToken = useCallback(async (): Promise<boolean> => {
    if (!token) return false;
    const res = await fetch("/api/verify-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        clipTopName: clipNames.top,
        clipBottomName: clipNames.bottom,
      }),
    });
    if (res.status === 425) throw new Error("425: too early");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Verification failed");
    }
    return true;
  }, [token, clipNames]);

  const startEncoding = useCallback(() => {
    setState("encoding");
  }, []);

  const finish = useCallback(() => {
    setState("done");
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setToken(null);
    setIssuedAt(null);
    setSkipAd(false);
    setError(null);
  }, []);

  return {
    state,
    token,
    issuedAt,
    skipAd,
    error,
    requestToken,
    verifyToken,
    startEncoding,
    finish,
    reset,
  };
}
