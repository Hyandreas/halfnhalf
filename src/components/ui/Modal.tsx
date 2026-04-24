"use client";

import { useEffect, ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className = "" }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(74, 55, 40, 0.5)", backdropFilter: "blur(4px)" }}
    >
      <div
        className={`bg-cream border-2 border-tan rounded-2xl warm-shadow max-w-md w-full ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
      {onClose && (
        <div className="absolute inset-0 -z-10" onClick={onClose} />
      )}
    </div>
  );
}
