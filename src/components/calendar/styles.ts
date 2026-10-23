import type { CatIndex, ChipStyle } from "@/lib/calendar";

export const CAT_CLASS: Record<CatIndex, { bar: string; light: string; solid: string }> = {
  1: { bar: "border-l-cat-1", light: "bg-cat-1-light", solid: "bg-cat-1" },
  2: { bar: "border-l-cat-2", light: "bg-cat-2-light", solid: "bg-cat-2" },
  3: { bar: "border-l-cat-3", light: "bg-cat-3-light", solid: "bg-cat-3" },
  4: { bar: "border-l-cat-4", light: "bg-cat-4-light", solid: "bg-cat-4" },
  5: { bar: "border-l-cat-5", light: "bg-cat-5-light", solid: "bg-cat-5" },
};

export function chipClass(chip: ChipStyle, cat: CatIndex): string {
  switch (chip) {
    case "subject":
      return `border-l-[3px] ${CAT_CLASS[cat].bar} ${CAT_CLASS[cat].light} text-foreground`;
    case "done":
      return `border-l-[3px] ${CAT_CLASS[cat].bar} bg-divider-soft text-muted-foreground`;
    case "missed":
      return "bg-status-danger-bg text-status-danger-fg line-through";
    case "pending":
      return "border border-dashed border-pending-dashed bg-card text-status-warning-fg";
  }
}

export function dotClass(chip: ChipStyle, cat: CatIndex): string {
  switch (chip) {
    case "subject":
      return CAT_CLASS[cat].solid;
    case "done":
      return `${CAT_CLASS[cat].solid} opacity-40`;
    case "missed":
      return "bg-status-danger-fg";
    case "pending":
      return "border border-dashed border-pending-dashed bg-card";
  }
}

export type LegendSwatch = { kind: "cat"; cat: CatIndex } | { kind: ChipStyle };

export function swatchClass(swatch: LegendSwatch): string {
  if (swatch.kind === "cat") return CAT_CLASS[swatch.cat].solid;
  if (swatch.kind === "done") return "border border-input bg-divider-soft";
  if (swatch.kind === "missed") return "bg-status-danger-bg";
  if (swatch.kind === "pending") return "border border-dashed border-pending-dashed bg-card";
  return "bg-accent";
}
