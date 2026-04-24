"use client";

interface ExportProgressProps {
  progress: number; // 0–1
}

export function ExportProgress({ progress }: ExportProgressProps) {
  const pct = Math.round(progress * 100);

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <p
        className="text-xs"
        style={{ fontFamily: "var(--font-press-start)", color: "#4a3728" }}
      >
        encoding...
      </p>

      <div className="w-full max-w-xs bg-tan/20 rounded-full h-3 overflow-hidden border border-tan/30">
        <div
          className="h-full rounded-full progress-shimmer transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-sm text-brown-light font-bold">{pct}%</p>

      <p className="text-xs text-brown-light opacity-60 text-center max-w-xs">
        this may take a moment depending on clip length
      </p>
    </div>
  );
}
