import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

const FFMPEG_CORE_VERSION = "0.12.6";
const BASE_URL = `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd`;

export async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) return ffmpegInstance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const ff = new FFmpeg();
    await ff.load({
      coreURL: await toBlobURL(
        `${BASE_URL}/ffmpeg-core.js`,
        "text/javascript"
      ),
      wasmURL: await toBlobURL(
        `${BASE_URL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    ffmpegInstance = ff;
    return ff;
  })();

  return loadPromise;
}

export async function stackVideos(
  topSource: File | string,
  bottomSource: File | string,
  onProgress: (ratio: number) => void
): Promise<Uint8Array> {
  const ff = await loadFFmpeg();

  ff.on("progress", ({ progress }) => onProgress(Math.min(progress, 1)));

  // Write inputs to FFmpeg virtual FS
  await ff.writeFile("top.mp4", await fetchFile(topSource));
  await ff.writeFile("bottom.mp4", await fetchFile(bottomSource));

  await ff.exec([
    "-i", "top.mp4",
    "-i", "bottom.mp4",
    "-filter_complex",
    // Scale each half to 1080×960 (cover fill), stack vertically → 1080×1920
    "[0:v]scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960,setsar=1[top];" +
    "[1:v]scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960,setsar=1[bot];" +
    "[top][bot]vstack=inputs=2[out]",
    "-map", "[out]",
    "-map", "0:a?",        // use top clip audio if present
    "-c:v", "libx264",
    "-preset", "ultrafast", // fastest in-browser encode
    "-crf", "23",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    "-r", "30",
    "-shortest",
    "output.mp4",
  ]);

  const data = (await ff.readFile("output.mp4")) as Uint8Array;

  // Clean up virtual FS
  await ff.deleteFile("top.mp4").catch(() => {});
  await ff.deleteFile("bottom.mp4").catch(() => {});
  await ff.deleteFile("output.mp4").catch(() => {});

  return data;
}

export function triggerDownload(data: Uint8Array, filename = "halfnhalf-export.mp4") {
  // Copy to a plain Uint8Array with a regular ArrayBuffer (FFmpeg may return SharedArrayBuffer)
  const plain = new Uint8Array(data);
  const blob = new Blob([plain], { type: "video/mp4" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
