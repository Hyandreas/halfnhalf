"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";

interface ClipSlotProps {
  label: "TOP" | "BOTTOM";
  clip: File | null;
  previewUrl: string | null;
  onFileSelect: (file: File, url: string) => void;
  onCreatorSearch?: () => void;
  isPro?: boolean;
}

export function ClipSlot({
  label,
  clip,
  previewUrl,
  onFileSelect,
  onCreatorSearch,
  isPro = false,
}: ClipSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("video/")) return;
      const url = URL.createObjectURL(file);
      onFileSelect(file, url);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-[9px] tracking-widest opacity-50"
        style={{ fontFamily: "var(--font-press-start)" }}
      >
        {label} CLIP
      </span>

      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-tan/40 warm-shadow-sm group">
          <video
            src={previewUrl}
            className="w-full h-36 object-cover"
            muted
            loop
            autoPlay
            playsInline
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-brown/0 group-hover:bg-brown/30 transition-colors text-cream opacity-0 group-hover:opacity-100 font-bold text-xs"
          >
            replace
          </button>
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-cream text-xs truncate drop-shadow font-semibold">
              {clip?.name}
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`upload-zone rounded-xl h-36 flex flex-col items-center justify-center gap-2 cursor-pointer ${dragging ? "dragging" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <span className="text-xl select-none font-bold" style={{ color: "rgba(74,55,40,0.3)" }}>
            {label === "TOP" ? "↑" : "↓"}
          </span>
          <p className="text-xs text-brown-light font-semibold text-center px-4">
            drop a clip or click to upload
          </p>
          {isPro && onCreatorSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onCreatorSearch(); }}
              className="text-[10px]"
            >
              ✦ search creator
            </Button>
          )}
        </div>
      )}

      {isPro && onCreatorSearch && previewUrl && (
        <button
          onClick={onCreatorSearch}
          className="text-xs text-brown-light hover:text-tan transition-colors text-center"
        >
          ✦ search creator instead
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
