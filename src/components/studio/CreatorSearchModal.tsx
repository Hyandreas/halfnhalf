"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ClipResult } from "@/types/api";

type Platform = "tiktok" | "instagram" | "youtube";

interface CreatorSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (clip: ClipResult) => void;
}

const PLATFORM_LABELS: Record<Platform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube Shorts",
};

export function CreatorSearchModal({ open, onClose, onSelect }: CreatorSearchModalProps) {
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [query, setQuery] = useState("");
  const [clips, setClips] = useState<ClipResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const search = useCallback(
    async (q: string, p: Platform, c: string | null = null) => {
      if (!q.trim()) return;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          query: q,
          platform: p,
          ...(c ? { cursor: c } : {}),
        });
        const res = await fetch(`/api/creator-search?${params}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "Search failed");
        }
        const data = await res.json();
        setClips((prev) => (c ? [...prev, ...data.clips] : data.clips));
        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Search failed");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced search on query change
  useEffect(() => {
    if (!query.trim()) { setClips([]); return; }
    const id = setTimeout(() => {
      setClips([]);
      setCursor(null);
      search(query, platform);
    }, 500);
    return () => clearTimeout(id);
  }, [query, platform, search]);

  // Reset on platform change
  useEffect(() => {
    setClips([]);
    setCursor(null);
    setError(null);
  }, [platform]);

  const handleSelect = (clip: ClipResult) => {
    onSelect(clip);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <div className="p-5 border-b border-tan/20 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2
            className="text-[10px]"
            style={{ fontFamily: "var(--font-press-start)", color: "#4a3728" }}
          >
            search creator
          </h2>
          <button
            onClick={onClose}
            className="text-brown-light hover:text-brown text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Platform tabs */}
        <div className="flex gap-2">
          {(["tiktok", "instagram", "youtube"] as Platform[]).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-colors ${
                platform === p
                  ? "bg-peach border-tan text-brown"
                  : "bg-cream border-tan/30 text-brown-light hover:border-tan/60"
              }`}
            >
              {PLATFORM_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Search input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            platform === "instagram"
              ? "username or paste reel URL..."
              : "creator name or @username..."
          }
          className="w-full border-2 border-tan/40 rounded-xl px-4 py-2.5 text-sm bg-cream text-brown placeholder:text-brown-light/50 focus:outline-none focus:border-peach"
        />
      </div>

      {/* Results */}
      <div className="overflow-y-auto flex-1 p-5">
        {loading && !clips.length && (
          <div className="flex justify-center py-8">
            <Spinner size={28} />
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-sm text-brown-light">{error}</p>
          </div>
        )}

        {!loading && !error && !clips.length && query.trim() && (
          <div className="text-center py-8">
            <p className="text-sm text-brown-light">no clips found</p>
          </div>
        )}

        {!query.trim() && (
          <div className="text-center py-8">
            <p className="text-sm text-brown-light opacity-60">
              search for a creator to browse their clips
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {clips.map((clip) => (
            <button
              key={clip.id}
              onClick={() => handleSelect(clip)}
              className="group relative aspect-[9/16] rounded-xl overflow-hidden border-2 border-tan/20 hover:border-peach transition-colors"
            >
              <Image
                src={clip.thumbnailUrl}
                alt={clip.description}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-brown/0 group-hover:bg-brown/30 transition-colors flex items-end p-2">
                <p className="text-cream text-[10px] font-bold opacity-0 group-hover:opacity-100 line-clamp-2 text-left">
                  {clip.description || clip.authorName}
                </p>
              </div>
              {clip.duration > 0 && (
                <span className="absolute top-2 right-2 bg-brown/70 text-cream text-[9px] px-1.5 py-0.5 rounded font-bold">
                  {Math.round(clip.duration)}s
                </span>
              )}
            </button>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => search(query, platform, cursor)}
              disabled={loading}
            >
              {loading ? <Spinner size={16} /> : "load more"}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
