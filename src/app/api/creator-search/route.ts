import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { ClipResult } from "@/types/api";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { data: user } = await supabase
    .from("users")
    .select("plan")
    .eq("clerk_id", userId)
    .single();

  if (!user || user.plan !== "pro") {
    return Response.json({ error: "Pro plan required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") ?? "";
  const platform = (searchParams.get("platform") ?? "tiktok") as
    | "tiktok"
    | "instagram"
    | "youtube";
  const cursor = searchParams.get("cursor") ?? "0";

  if (!query.trim()) {
    return Response.json({ clips: [], hasMore: false, nextCursor: null });
  }

  try {
    switch (platform) {
      case "tiktok":
        return Response.json(await searchTikTok(query, cursor));
      case "instagram":
        return Response.json(await searchInstagram(query));
      case "youtube":
        return Response.json(await searchYouTube(query, cursor));
      default:
        return Response.json({ error: "Unknown platform" }, { status: 400 });
    }
  } catch (e: unknown) {
    console.error("Creator search error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Search failed" },
      { status: 500 }
    );
  }
}

// ─── TikTok ──────────────────────────────────────────────────────────────────

async function searchTikTok(
  query: string,
  cursor: string
): Promise<{ clips: ClipResult[]; hasMore: boolean; nextCursor: string | null }> {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
  const HOST = "tiktok-scraper7.p.rapidapi.com";

  // Step 1: resolve username to uid
  const isHandle = query.startsWith("@");
  let uid: string;

  if (isHandle) {
    const username = query.replace("@", "");
    const profileRes = await fetch(
      `https://${HOST}/user/info?unique_id=${encodeURIComponent(username)}`,
      { headers: { "X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": HOST } }
    );
    const profileData = await profileRes.json();
    uid = profileData?.data?.user?.id;
  } else {
    // Search by keyword
    const searchRes = await fetch(
      `https://${HOST}/user/search?keyword=${encodeURIComponent(query)}&count=5`,
      { headers: { "X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": HOST } }
    );
    const searchData = await searchRes.json();
    uid = searchData?.data?.user_list?.[0]?.user_info?.uid;
  }

  if (!uid) return { clips: [], hasMore: false, nextCursor: null };

  // Step 2: fetch posts
  const postsRes = await fetch(
    `https://${HOST}/user/posts?user_id=${uid}&count=20&cursor=${cursor}`,
    { headers: { "X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": HOST } }
  );
  const postsData = await postsRes.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clips: ClipResult[] = (postsData?.data?.videos ?? []).map((v: any) => ({
    id: v.video_id ?? v.id,
    thumbnailUrl: v.cover ?? v.origin_cover,
    videoUrl: v.play ?? v.wmplay,
    duration: Number(v.duration ?? 0),
    description: v.title ?? "",
    authorName: v.author?.nickname ?? "",
    platform: "tiktok" as const,
  }));

  return {
    clips,
    hasMore: postsData?.data?.has_more ?? false,
    nextCursor: postsData?.data?.cursor?.toString() ?? null,
  };
}

// ─── Instagram ───────────────────────────────────────────────────────────────

async function searchInstagram(
  query: string
): Promise<{ clips: ClipResult[]; hasMore: boolean; nextCursor: string | null }> {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
  const HOST = "instagram-scraper-api2.p.rapidapi.com";

  // Check if it's a direct reel URL
  const isReelUrl =
    query.includes("instagram.com/reel") || query.includes("instagram.com/p/");

  if (isReelUrl) {
    // Resolve direct reel URL to download URL
    const res = await fetch(
      `https://${HOST}/v1/post_info?url=${encodeURIComponent(query)}`,
      { headers: { "X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": HOST } }
    );
    const data = await res.json();
    const videoUrl =
      data?.data?.video_versions?.[0]?.url ??
      data?.data?.clips_metadata?.encoding_tag;

    if (!videoUrl) return { clips: [], hasMore: false, nextCursor: null };

    return {
      clips: [
        {
          id: data?.data?.pk ?? query,
          thumbnailUrl: data?.data?.image_versions2?.candidates?.[0]?.url ?? "",
          videoUrl,
          duration: Number(data?.data?.video_duration ?? 0),
          description: data?.data?.caption?.text ?? "",
          authorName: data?.data?.user?.username ?? "",
          platform: "instagram",
        },
      ],
      hasMore: false,
      nextCursor: null,
    };
  }

  // Search by username
  const username = query.replace("@", "");
  const userRes = await fetch(
    `https://${HOST}/v1/user/by/username?username=${encodeURIComponent(username)}`,
    { headers: { "X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": HOST } }
  );
  const userData = await userRes.json();
  const userId = userData?.data?.pk;

  if (!userId) return { clips: [], hasMore: false, nextCursor: null };

  const reelsRes = await fetch(
    `https://${HOST}/v1/user/reels?user_id=${userId}`,
    { headers: { "X-RapidAPI-Key": RAPIDAPI_KEY, "X-RapidAPI-Host": HOST } }
  );
  const reelsData = await reelsRes.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clips: ClipResult[] = (reelsData?.data?.items ?? []).map((item: any) => ({
    id: item.pk ?? item.id,
    thumbnailUrl: item.image_versions2?.candidates?.[0]?.url ?? "",
    videoUrl: item.video_versions?.[0]?.url ?? "",
    duration: Number(item.video_duration ?? 0),
    description: item.caption?.text ?? "",
    authorName: item.user?.username ?? "",
    platform: "instagram" as const,
  }));

  return { clips, hasMore: false, nextCursor: null };
}

// ─── YouTube Shorts ──────────────────────────────────────────────────────────

async function searchYouTube(
  query: string,
  _cursor: string
): Promise<{ clips: ClipResult[]; hasMore: boolean; nextCursor: string | null }> {
  const YT_KEY = process.env.YOUTUBE_DATA_API_KEY!;

  // Step 1: Find channel
  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=1&key=${YT_KEY}`
  );
  const channelData = await channelRes.json();
  const channelId = channelData?.items?.[0]?.id?.channelId;

  if (!channelId) return { clips: [], hasMore: false, nextCursor: null };

  // Step 2: Get channel's Shorts (videos ≤ 60s, vertical — filter by videoDuration=short)
  const videosRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelId=${channelId}&videoDuration=short&maxResults=20&key=${YT_KEY}`
  );
  const videosData = await videosRes.json();

  // Step 3: Resolve download URLs with yt-dlp for each video
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clips: ClipResult[] = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (videosData?.items ?? []).map(async (item: any) => {
      const videoId = item.id?.videoId;
      let videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      try {
        // yt-dlp must be installed on the server
        const { stdout } = await execAsync(
          `yt-dlp -f "bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4]" --get-url "https://www.youtube.com/watch?v=${videoId}"`,
          { timeout: 15000 }
        );
        videoUrl = stdout.trim().split("\n")[0];
      } catch {
        // yt-dlp failed — return YouTube URL as fallback
      }

      return {
        id: videoId,
        thumbnailUrl: item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.default?.url ?? "",
        videoUrl,
        duration: 0, // YouTube search API doesn't return duration; would need videos.list
        description: item.snippet?.title ?? "",
        authorName: item.snippet?.channelTitle ?? "",
        platform: "youtube" as const,
      };
    })
  );

  return {
    clips,
    hasMore: !!(videosData?.nextPageToken),
    nextCursor: videosData?.nextPageToken ?? null,
  };
}
