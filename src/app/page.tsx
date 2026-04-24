import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#FFF8F0" }}
    >
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Image src="/halfnhalf.png" alt="halfnhalf" width={36} height={36} className="rounded-lg" />
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm font-semibold transition-colors"
            style={{ color: "#7a5c47" }}
          >
            sign in
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 rounded-xl border-2 font-bold text-sm retro-press transition-colors"
            style={{
              borderColor: "#D4A574",
              backgroundColor: "#FFB997",
              color: "#4a3728",
              boxShadow: "2px 2px 0px #D4A574",
            }}
          >
            get started →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-12 pb-16">
        <div className="flex flex-col gap-6 max-w-xl">
          <div className="flex justify-center mb-2">
            <Image src="/halfnhalf.png" alt="halfnhalf" width={72} height={72} className="rounded-2xl" />
          </div>
          <h1
            className="text-[11px] leading-[2.5] tracking-wide"
            style={{ fontFamily: "var(--font-press-start)", color: "#4a3728" }}
          >
            stack two clips.
            <br />
            make a short.
          </h1>
          <p className="text-base leading-relaxed max-w-sm mx-auto" style={{ color: "#7a5c47" }}>
            drop your top and bottom clips, preview the split-screen, and export
            a{" "}
            <span className="font-bold" style={{ color: "#D4A574" }}>
              1080×1920 YouTube Shorts
            </span>{" "}
            video in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
            <Link
              href="/sign-up"
              className="px-7 py-3.5 rounded-xl border-2 font-bold text-sm retro-press transition-colors"
              style={{
                borderColor: "#D4A574",
                backgroundColor: "#FFB997",
                color: "#4a3728",
                boxShadow: "4px 4px 0px #D4A574",
              }}
            >
              try for free →
            </Link>
            <Link
              href="/billing"
              className="px-7 py-3.5 rounded-xl border-2 font-semibold text-sm retro-press transition-colors"
              style={{
                borderColor: "rgba(212,165,116,0.4)",
                backgroundColor: "#FFF8F0",
                color: "#7a5c47",
                boxShadow: "2px 2px 0px #D4A574",
              }}
            >
              see pro plan
            </Link>
          </div>
        </div>

        {/* Demo visual */}
        <div className="flex items-center gap-8 flex-wrap justify-center">
          <div
            className="relative rounded-3xl overflow-hidden flex-shrink-0"
            style={{
              width: 120,
              height: 213,
              border: "4px solid rgba(212,165,116,0.5)",
              boxShadow: "4px 4px 0px #D4A574",
            }}
          >
            <div
              className="w-full flex items-center justify-center"
              style={{
                height: "50%",
                backgroundColor: "#FFB997",
                borderBottom: "2px dashed rgba(212,165,116,0.4)",
              }}
            >
              <span className="text-xs" style={{ color: "rgba(74,55,40,0.5)" }}>
                top clip
              </span>
            </div>
            <div
              className="w-full flex items-center justify-center"
              style={{ height: "50%", backgroundColor: "#E8A598" }}
            >
              <span className="text-xs" style={{ color: "rgba(74,55,40,0.5)" }}>
                bottom clip
              </span>
            </div>
            <div
              className="absolute bottom-2 left-0 right-0 text-center opacity-30"
              style={{ fontSize: 6, fontFamily: "var(--font-press-start)" }}
            >
              1080×1920
            </div>
          </div>

          <div className="flex flex-col gap-4 text-left max-w-xs">
            {[
              { emoji: "↑", text: "drop a clip on top" },
              { emoji: "↓", text: "drop a clip on bottom" },
              { emoji: "✦", text: "preview your split-screen" },
              { emoji: "→", text: "export and post" },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-lg w-8 text-center flex-shrink-0">{emoji}</span>
                <p className="text-sm font-semibold" style={{ color: "#7a5c47" }}>
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pro callout */}
        <div
          className="rounded-2xl px-8 py-6 max-w-lg text-center flex flex-col gap-3"
          style={{
            border: "2px solid rgba(212,165,116,0.3)",
            backgroundColor: "rgba(255,185,151,0.08)",
            boxShadow: "2px 2px 0px #D4A574",
          }}
        >
          <p
            className="text-[9px]"
            style={{ fontFamily: "var(--font-press-start)", color: "#D4A574" }}
          >
            ✦ PRO PLAN
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#7a5c47" }}>
            Search any creator on{" "}
            <span className="font-bold" style={{ color: "#4a3728" }}>
              TikTok
            </span>
            ,{" "}
            <span className="font-bold" style={{ color: "#4a3728" }}>
              Instagram
            </span>
            , or{" "}
            <span className="font-bold" style={{ color: "#4a3728" }}>
              YouTube Shorts
            </span>{" "}
            and use their clips directly. Plus unlimited exports and zero ad
            breaks.
          </p>
          <Link
            href="/billing"
            className="text-xs font-bold transition-colors"
            style={{ color: "#D4A574" }}
          >
            upgrade for $9.99/mo →
          </Link>
        </div>

        <p className="text-xs" style={{ color: "rgba(122,92,71,0.5)" }}>
          free forever · 5 exports/week · no credit card required
        </p>
      </main>

      <footer
        className="py-5 text-center"
        style={{ borderTop: "1px solid rgba(212,165,116,0.2)" }}
      >
        <p className="text-xs" style={{ color: "rgba(122,92,71,0.35)" }}>
          halfnhalf · made with ✦
        </p>
      </footer>
    </div>
  );
}
