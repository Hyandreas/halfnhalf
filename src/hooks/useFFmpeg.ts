"use client";

import { useState, useCallback } from "react";
import { loadFFmpeg, stackVideos, triggerDownload } from "@/lib/ffmpeg";

export type EncodeState = "idle" | "loading" | "encoding" | "done" | "error";

export function useFFmpeg() {
  const [state, setState] = useState<EncodeState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const preload = useCallback(async () => {
    try {
      await loadFFmpeg();
    } catch (e) {
      console.warn("FFmpeg preload failed:", e);
    }
  }, []);

  const encode = useCallback(
    async (
      topSource: File | string,
      bottomSource: File | string,
      filename?: string
    ) => {
      setState("loading");
      setProgress(0);
      setError(null);
      try {
        await loadFFmpeg();
        setState("encoding");
        const data = await stackVideos(topSource, bottomSource, setProgress);
        triggerDownload(data, filename);
        setState("done");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Encoding failed");
        setState("error");
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState("idle");
    setProgress(0);
    setError(null);
  }, []);

  return { state, progress, error, encode, preload, reset };
}
