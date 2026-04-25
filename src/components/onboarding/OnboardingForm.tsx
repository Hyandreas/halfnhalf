"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Belarus","Belgium","Belize",
  "Benin","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria",
  "Burkina Faso","Cambodia","Cameroon","Canada","Chile","China","Colombia","Costa Rica",
  "Croatia","Cuba","Cyprus","Czech Republic","Denmark","Dominican Republic","Ecuador",
  "Egypt","El Salvador","Estonia","Ethiopia","Finland","France","Georgia","Germany",
  "Ghana","Greece","Guatemala","Honduras","Hungary","Iceland","India","Indonesia","Iran",
  "Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya",
  "Kuwait","Latvia","Lebanon","Libya","Lithuania","Luxembourg","Malaysia","Malta","Mexico",
  "Moldova","Mongolia","Morocco","Myanmar","Nepal","Netherlands","New Zealand","Nicaragua",
  "Nigeria","Norway","Oman","Pakistan","Panama","Paraguay","Peru","Philippines","Poland",
  "Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia",
  "Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","Spain",
  "Sri Lanka","Sudan","Sweden","Switzerland","Syria","Taiwan","Tanzania","Thailand",
  "Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom",
  "United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zimbabwe",
];

const REFERRAL_OPTIONS = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter / X" },
  { value: "friend", label: "Friend or word of mouth" },
  { value: "google", label: "Google search" },
  { value: "reddit", label: "Reddit" },
  { value: "other", label: "Other" },
];

const STEPS = ["welcome", "personal", "about"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [country, setCountry] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex) / (STEPS.length - 1)) * 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          birth_date: birthDate,
          country,
          referral_source: referralSource || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push("/studio");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  const inputClass =
    "border-2 border-tan/50 rounded-xl bg-cream text-brown px-3 py-2.5 text-sm focus:border-peach focus:outline-none w-full transition-colors";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-4"
      style={{ backgroundColor: "#FFF8F0" }}
    >
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <Image src="/halfnhalf.png" alt="halfnhalf" width={56} height={56} className="rounded-2xl" />
          {step === "welcome" && (
            <>
              <h1
                className="text-[10px] leading-loose"
                style={{ fontFamily: "var(--font-press-start)", color: "#4a3728" }}
              >
                welcome!
              </h1>
              <p className="text-sm text-brown-light">
                let&apos;s get you set up in 30 seconds ✦
              </p>
            </>
          )}
          {step === "personal" && (
            <p className="text-sm text-brown-light">tell us a little about yourself</p>
          )}
          {step === "about" && (
            <p className="text-sm text-brown-light">almost done!</p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: "rgba(212,165,116,0.2)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: "#D4A574" }}
          />
        </div>

        {/* Card */}
        <div
          className="w-full bg-cream border-2 border-tan/40 rounded-2xl p-6 flex flex-col gap-5"
          style={{ boxShadow: "4px 4px 0 #D4A574" }}
        >
          {/* Step: welcome */}
          {step === "welcome" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-brown leading-relaxed">
                halfnhalf turns two clips into a split-screen Short in seconds — all right in your browser.
              </p>
              <ul className="flex flex-col gap-2 text-sm text-brown-light">
                <li>✦ stack any two clips, top + bottom</li>
                <li>✦ preview before you export</li>
                <li>✦ 1080×1920 MP4, ready to post</li>
              </ul>
              <button
                onClick={() => setStep("personal")}
                className="mt-2 bg-peach border-2 border-tan text-brown font-bold rounded-xl py-2.5 text-sm hover:bg-tan hover:text-cream transition-colors"
              >
                let&apos;s go →
              </button>
            </div>
          )}

          {/* Step: personal info */}
          {step === "personal" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-brown">
                  your name <span style={{ color: "#E8A598" }}>*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  className={inputClass}
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-brown">
                  date of birth <span style={{ color: "#E8A598" }}>*</span>
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-brown">
                  country <span style={{ color: "#E8A598" }}>*</span>
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={inputClass}
                  style={{ appearance: "none" }}
                >
                  <option value="">select a country…</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  if (!name.trim()) { setError("Please enter your name"); return; }
                  if (!birthDate) { setError("Please enter your date of birth"); return; }
                  if (!country) { setError("Please select your country"); return; }
                  setError(null);
                  setStep("about");
                }}
                className="mt-1 bg-peach border-2 border-tan text-brown font-bold rounded-xl py-2.5 text-sm hover:bg-tan hover:text-cream transition-colors"
              >
                next →
              </button>

              {error && <p className="text-xs text-center" style={{ color: "#E8A598" }}>{error}</p>}
            </div>
          )}

          {/* Step: about */}
          {step === "about" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-brown">
                  how did you hear about halfnhalf?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {REFERRAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setReferralSource(referralSource === opt.value ? "" : opt.value)}
                      className="px-3 py-2 rounded-xl border-2 text-xs font-semibold transition-colors text-left"
                      style={{
                        borderColor: referralSource === opt.value ? "#D4A574" : "rgba(212,165,116,0.35)",
                        backgroundColor: referralSource === opt.value ? "rgba(255,185,151,0.25)" : "#FFF8F0",
                        color: referralSource === opt.value ? "#4a3728" : "#7a6652",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs text-center" style={{ color: "#E8A598" }}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 bg-peach border-2 border-tan text-brown font-bold rounded-xl py-2.5 text-sm hover:bg-tan hover:text-cream transition-colors disabled:opacity-50"
              >
                {loading ? "saving…" : "go to studio ✦"}
              </button>

              <button
                type="button"
                onClick={() => setStep("personal")}
                className="text-xs text-brown-light hover:text-brown transition-colors text-center"
              >
                ← back
              </button>
            </form>
          )}
        </div>

        <p className="text-xs text-center" style={{ color: "rgba(122,92,71,0.4)" }}>
          your info is kept private and never sold.
        </p>
      </div>
    </div>
  );
}
