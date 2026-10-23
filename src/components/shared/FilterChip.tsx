"use client";

import type { ReactNode } from "react";
import { cn } from "cn";

type FilterChipProps = {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  children: ReactNode;
  className?: string;
};

export function FilterChip({ pressed = false, onPressedChange, children, className }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange?.(!pressed)}
      className={cn(
        "inline-flex h-9 items-center rounded-full px-3.5 text-[13px] transition-colors",
        pressed
          ? "border-2 border-primary bg-accent font-bold text-primary"
          : "border border-input bg-card font-medium text-text-secondary",
        className,
      )}
    >
      {children}
    </button>
  );
}
