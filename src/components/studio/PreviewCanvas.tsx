"use client";

import { useEffect, useRef } from "react";

interface PreviewCanvasProps {
  topUrl: string | null;
  bottomUrl: string | null;
}

export function PreviewCanvas({ topUrl, bottomUrl }: PreviewCanvasProps) {
  const topRef = useRef<HTMLVideoElement>(null);
  const bottomRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (topRef.current && topUrl) {
      topRef.current.src = topUrl;
      topRef.current.play().catch(() => {});
    }
  }, [topUrl]);

  useEffect(() => {
    if (bottomRef.current && bottomUrl) {
      bottomRef.current.src = bottomUrl;
      bottomRef.current.play().catch(() => {});
    }
  }, [bottomUrl]);

  const isEmpty = !topUrl && !bottomUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      <span
        className="text-[9px] tracking-widest opacity-50"
        style={{ fontFamily: "var(--font-press-start)" }}
      >
        PREVIEW
      </span>

      {/* 9:16 frame — shown at ~200px wide for the sidebar preview */}
      <div
        className="shorts-frame warm-shadow border-2 border-tan/30 bg-brown/10 overflow-hidden"
        style={{ width: 180, height: 320 }}
      >
        {/* Top half */}
        <div className="relative w-full overflow-hidden" style={{ height: "50%" }}>
          {topUrl ? (
            <video
              ref={topRef}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-peach/20">
              <span className="text-xs text-brown-light opacity-60">top</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-0.5 bg-tan/40" />

        {/* Bottom half */}
        <div className="relative w-full overflow-hidden" style={{ height: "50%" }}>
          {bottomUrl ? (
            <video
              ref={bottomRef}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-rose/20">
              <span className="text-xs text-brown-light opacity-60">bottom</span>
            </div>
          )}
        </div>
      </div>

      {isEmpty && (
        <p className="text-xs text-brown-light opacity-50 text-center max-w-[180px]">
          add clips to see your preview
        </p>
      )}

      <p className="text-[9px] opacity-30" style={{ fontFamily: "var(--font-press-start)" }}>
        1080 × 1920
      </p>
    </div>
  );
}
