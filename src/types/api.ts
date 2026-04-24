export interface ClipResult {
  id: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number;
  description: string;
  authorName: string;
  platform: "tiktok" | "instagram" | "youtube";
}

export interface ExportTokenResponse {
  token: string;
  issuedAt: string;
  skipAd: boolean;
}

export interface VerifyTokenResponse {
  ok: boolean;
}

export interface CreatorSearchResponse {
  clips: ClipResult[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface BillingCheckoutResponse {
  url: string;
}

export interface BillingPortalResponse {
  url: string;
}
