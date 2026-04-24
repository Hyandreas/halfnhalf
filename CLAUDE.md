# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm start        # Start production server
```

No test runner or lint script is configured.

## What this app is

**halfnhalf** creates split-screen YouTube Shorts by stacking two video clips (top + bottom) into a 1080×1920 vertical video. Video encoding runs entirely client-side via FFmpeg.wasm.

- **Free plan**: Upload local clips only, watch a 20-second ad before each export, 5 exports/week limit
- **Pro plan** ($9.99/mo): Search TikTok/Instagram/YouTube creators directly, unlimited exports, no ads

## Architecture

### Auth & data flow
- **Clerk** handles auth; webhooks at `/api/webhooks/clerk` sync user creates/updates/deletes into Supabase
- **Supabase** stores users, export_records, and export_tokens — access via `src/lib/supabase/`
- **Stripe** webhooks at `/api/webhooks/stripe` update `plan` and `subscription_status` on the users table
- **middleware.ts** enforces Clerk auth on all routes except `/`, `/sign-in`, `/sign-up`, and webhook paths

### Export flow
Free: `POST /api/export-token` (issue JWT token, log clip names) → AdBreakModal (20s ad) → `POST /api/verify-token` (mark used, log export) → FFmpeg encode  
Pro: `POST /api/export-token` → skip ad → FFmpeg encode immediately  
Rate limiting is enforced in `src/lib/usage.ts` via `canExport(plan, weekly_count)`.

### Client-side encoding
`src/lib/ffmpeg.ts` — `loadFFmpeg` and `stackVideos` (outputs 1080×1920). FFmpeg.wasm requires `SharedArrayBuffer`, which requires COOP/COEP headers. These are set in `next.config.ts` only for the `/studio` route.

### Creator search
`GET /api/creator-search` fans out to TikTok/Instagram (RapidAPI scrapers) and YouTube Data API v3. Video download URLs are resolved via a `yt-dlp` CLI call server-side.

### Route groups
- `(app)/` — protected routes: `studio/` (main editor), `billing/` (subscription page)
- `(auth)/` — Clerk-hosted: `sign-in/`, `sign-up/`

### Key files
- `src/hooks/useExportFlow.ts` — orchestrates the token → [ad | skip] → encode state machine
- `src/hooks/useFFmpeg.ts` — FFmpeg load state
- `src/lib/export-token.ts` — JOSE-based JWT sign/verify for export tokens (10-min expiry)
- `src/lib/constants.ts` — `FREE_EXPORTS_PER_WEEK`, `AD_DURATION_SECONDS`, `EXPORT_TOKEN_EXPIRY_SECONDS`
- `src/types/` — `ClipResult` (search result shape), `User`/`ExportRecord`/`ExportToken` DB interfaces
- `supabase/schema.sql` — canonical DB schema

## Environment variables

All required keys are documented in `.env`. Needed services: Clerk, Supabase (including service role key), Stripe, RapidAPI, YouTube Data API v3, Google AdSense (optional).
