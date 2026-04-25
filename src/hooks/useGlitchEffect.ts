"use client";

import { RefObject, useEffect } from "react";

export function useGlitchEffect(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    function scheduleNext() {
      timeout = setTimeout(() => {
        if (cancelled) return;
        ref.current?.classList.add("glitch-active");
        setTimeout(() => {
          ref.current?.classList.remove("glitch-active");
          if (!cancelled) scheduleNext();
        }, 160);
      }, 8000 + Math.random() * 7000);
    }

    scheduleNext();
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [ref]);
}
