"use client";

import { useState, useEffect } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  color: string;
  duration: number;
}

const COLORS = ["#FFB997", "#D4A574", "#E8A598"];
let idCounter = 0;

function createSparkle(): Sparkle {
  return {
    id: idCounter++,
    x: 5 + Math.random() * 90,
    y: 40 + Math.random() * 50,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    duration: 4 + Math.random() * 2.5,
  };
}

export function FloatingSparkles() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    function scheduleNext() {
      timeout = setTimeout(() => {
        if (cancelled) return;
        setSparkles(prev =>
          prev.length < 8 ? [...prev, createSparkle()] : prev
        );
        scheduleNext();
      }, 2500 + Math.random() * 2000);
    }

    const initial = setTimeout(() => {
      if (cancelled) return;
      setSparkles([createSparkle()]);
      scheduleNext();
    }, 1200);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      clearTimeout(initial);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 51 }}
      aria-hidden="true"
    >
      {sparkles.map(s => (
        <span
          key={s.id}
          onAnimationEnd={() =>
            setSparkles(prev => prev.filter(x => x.id !== s.id))
          }
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            color: s.color,
            fontSize: "9px",
            fontFamily: "var(--font-press-start)",
            animation: `sparkle-float ${s.duration}s ease-out forwards`,
            lineHeight: 1,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}
