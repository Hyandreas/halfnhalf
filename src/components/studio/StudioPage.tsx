"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ClipSlot } from "./ClipSlot";
import { PreviewCanvas } from "./PreviewCanvas";
import { ExportButton } from "./ExportButton";
import { AdBreakModal } from "./AdBreakModal";
import { ExportProgress } from "./ExportProgress";
import { CreatorSearchModal } from "./CreatorSearchModal";
import { Card } from "@/components/ui/Card";
import { useExportFlow } from "@/hooks/useExportFlow";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import { useGlitchEffect } from "@/hooks/useGlitchEffect";
import { ClipResult } from "@/types/api";

interface StudioPageProps {
  plan: "free" | "pro";
  exportsUsed: number;
  canExport: boolean;
}

type CreatorSlot = "top" | "bottom" | null;

export function StudioPage({ plan, exportsUsed, canExport }: StudioPageProps) {
  const [topFile, setTopFile] = useState<File | null>(null);
  const [topUrl, setTopUrl] = useState<string | null>(null);
  const [bottomFile, setBottomFile] = useState<File | null>(null);
  const [bottomUrl, setBottomUrl] = useState<string | null>(null);
  const [creatorSlot, setCreatorSlot] = useState<CreatorSlot>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  useGlitchEffect(headingRef);

  const exportFlow = useExportFlow();
  const ffmpeg = useFFmpeg();

  const isPro = plan === "pro";
  const isReady = !!(topFile || topUrl) && !!(bottomFile || bottomUrl);

  // Preload FFmpeg in background when both clips are ready
  useEffect(() => {
    if (isReady) ffmpeg.preload();
  }, [isReady, ffmpeg]);

  const handleExport = useCallback(async () => {
    if (!isReady) return;

    const topName = topFile?.name ?? "creator-clip";
    const bottomName = bottomFile?.name ?? "creator-clip";

    try {
      const result = await exportFlow.requestToken(topName, bottomName);

      if (result.skipAd) {
        // Pro path: go straight to encoding
        exportFlow.startEncoding();
        await ffmpeg.encode(
          topFile ?? topUrl!,
          bottomFile ?? bottomUrl!,
          "halfnhalf-export.mp4"
        );
        exportFlow.finish();
      }
      // Free path: ad-break modal takes over via exportFlow.state === 'ad-break'
    } catch {
      // error already set in exportFlow
    }
  }, [isReady, topFile, topUrl, bottomFile, bottomUrl, exportFlow, ffmpeg]);

  const handleAdVerify = useCallback(async (): Promise<boolean> => {
    return exportFlow.verifyToken();
  }, [exportFlow]);

  const handleAdSuccess = useCallback(async () => {
    exportFlow.startEncoding();
    await ffmpeg.encode(
      topFile ?? topUrl!,
      bottomFile ?? bottomUrl!,
      "halfnhalf-export.mp4"
    );
    exportFlow.finish();
  }, [exportFlow, ffmpeg, topFile, topUrl, bottomFile, bottomUrl]);

  const handleCreatorSelect = useCallback(
    (clip: ClipResult) => {
      if (creatorSlot === "top") {
        setTopFile(null);
        setTopUrl(clip.videoUrl);
      } else if (creatorSlot === "bottom") {
        setBottomFile(null);
        setBottomUrl(clip.videoUrl);
      }
      setCreatorSlot(null);
    },
    [creatorSlot]
  );

  const isEncoding =
    exportFlow.state === "encoding" || ffmpeg.state === "encoding" || ffmpeg.state === "loading";
  const isDone = exportFlow.state === "done" || ffmpeg.state === "done";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Page title */}
      <div className="mb-8 text-center">
        <h1
          ref={headingRef}
          className="text-xs leading-loose"
          style={{ fontFamily: "var(--font-press-start)", color: "#4a3728" }}
        >
          studio
        </h1>
        <p className="text-sm text-brown-light mt-1">
          stack two clips into a {" "}
          <span className="font-bold text-tan">YouTube Shorts</span>
          {" "} video
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left: clip uploaders */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <Card elevated>
            <div className="flex flex-col gap-6">
              <ClipSlot
                label="TOP"
                clip={topFile}
                previewUrl={topUrl}
                onFileSelect={(file, url) => { setTopFile(file); setTopUrl(url); }}
                onCreatorSearch={isPro ? () => setCreatorSlot("top") : undefined}
                isPro={isPro}
              />
              <div className="border-t-2 border-dashed border-tan/30" />
              <ClipSlot
                label="BOTTOM"
                clip={bottomFile}
                previewUrl={bottomUrl}
                onFileSelect={(file, url) => { setBottomFile(file); setBottomUrl(url); }}
                onCreatorSearch={isPro ? () => setCreatorSlot("bottom") : undefined}
                isPro={isPro}
              />
            </div>
          </Card>

          {/* Encoding state */}
          {isEncoding && (
            <Card>
              <ExportProgress progress={ffmpeg.progress} />
            </Card>
          )}

          {isDone && !isEncoding && (
            <Card>
              <div className="text-center py-4 flex flex-col gap-3">
                <p
                  className="text-xs"
                  style={{ fontFamily: "var(--font-press-start)", color: "#A8C5A0" }}
                >
                  done! ✦
                </p>
                <p className="text-sm text-brown-light">
                  your video downloaded — check your downloads folder
                </p>
                <button
                  onClick={() => { exportFlow.reset(); ffmpeg.reset(); }}
                  className="text-xs text-tan hover:text-peach font-semibold transition-colors"
                >
                  make another →
                </button>
              </div>
            </Card>
          )}

          {(exportFlow.error || ffmpeg.error) && (
            <Card>
              <p className="text-sm text-center" style={{ color: "#E8A598" }}>
                {exportFlow.error ?? ffmpeg.error}
              </p>
              <button
                onClick={() => { exportFlow.reset(); ffmpeg.reset(); }}
                className="block mx-auto mt-2 text-xs text-tan hover:text-peach font-semibold"
              >
                try again →
              </button>
            </Card>
          )}
        </div>

        {/* Right: preview + export */}
        <div className="flex flex-col gap-5 sticky top-20">
          <Card>
            <PreviewCanvas topUrl={topUrl} bottomUrl={bottomUrl} />
          </Card>

          {!isEncoding && !isDone && (
            <Card>
              <ExportButton
                canExport={canExport}
                isPro={isPro}
                exportsUsed={exportsUsed}
                isReady={isReady}
                onExport={handleExport}
              />
            </Card>
          )}
        </div>
      </div>

      {/* Ad break modal (free users) */}
      <AdBreakModal
        open={exportFlow.state === "ad-break"}
        issuedAt={exportFlow.issuedAt}
        onVerify={handleAdVerify}
        onSuccess={handleAdSuccess}
      />

      {/* Creator search modal (pro users) */}
      <CreatorSearchModal
        open={creatorSlot !== null}
        onClose={() => setCreatorSlot(null)}
        onSelect={handleCreatorSelect}
      />
    </div>
  );
}
