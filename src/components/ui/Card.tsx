import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ elevated = false, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`bg-cream border-2 border-tan/40 rounded-xl p-5 ${elevated ? "warm-shadow" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
