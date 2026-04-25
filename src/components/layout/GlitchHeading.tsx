"use client";

import { useRef } from "react";
import { useGlitchEffect } from "@/hooks/useGlitchEffect";

interface GlitchHeadingProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function GlitchHeading({ children, className, style }: GlitchHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  useGlitchEffect(ref);
  return (
    <h1 ref={ref} className={className} style={style}>
      {children}
    </h1>
  );
}
