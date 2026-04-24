"use client";

import { Button } from "@/components/ui/Button";
import { FREE_EXPORTS_PER_WEEK } from "@/lib/constants";

interface ExportButtonProps {
  canExport: boolean;
  isPro: boolean;
  exportsUsed: number;
  isReady: boolean;
  onExport: () => void;
}

export function ExportButton({
  canExport,
  isPro,
  exportsUsed,
  isReady,
  onExport,
}: ExportButtonProps) {
  const exportsLeft = Math.max(0, FREE_EXPORTS_PER_WEEK - exportsUsed);

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        size="lg"
        onClick={onExport}
        disabled={!isReady || !canExport}
        className="w-full"
      >
        {!canExport
          ? "limit reached this week"
          : isPro
          ? "✦ export"
          : "export (ad break)"}
      </Button>

      {!isPro && (
        <p className="text-xs text-brown-light text-center">
          {canExport ? (
            <>
              <span className="font-bold text-tan">{exportsLeft}</span> of{" "}
              {FREE_EXPORTS_PER_WEEK} exports left this week
            </>
          ) : (
            <>
              weekly limit reached.{" "}
              <a href="/billing" className="text-peach font-bold hover:underline">
                upgrade to pro →
              </a>
            </>
          )}
        </p>
      )}

      {!isReady && canExport && (
        <p className="text-xs text-brown-light opacity-60">
          add both clips to export
        </p>
      )}
    </div>
  );
}
