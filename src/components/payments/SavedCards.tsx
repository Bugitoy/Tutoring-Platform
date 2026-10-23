import { cn } from "cn";
import type { SavedCard } from "@/lib/types";

type SavedCardsProps = {
  cards: SavedCard[];
  /** "student" shows "Debit · expires 05/29"; "parent" shows "Expires 08/28 · default". */
  variant: "student" | "parent";
};

function cardLine(card: SavedCard, variant: SavedCardsProps["variant"]) {
  if (variant === "student") {
    return `${card.kind === "credit" ? "Credit" : "Debit"} · expires ${card.expiry}`;
  }
  return `Expires ${card.expiry}${card.isDefault ? " · default" : ""}`;
}

export function SavedCards({ cards, variant }: SavedCardsProps) {
  const ordered = [...cards].sort((a, b) => Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)));
  return (
    <ul className="flex flex-col gap-2.5">
      {ordered.map((card, index) => {
        const primary = card.isDefault || (variant === "student" && index === 0);
        return (
          <li
            key={`${card.brand}-${card.last4}`}
            className={cn(
              "flex items-center gap-3 rounded-xl bg-card px-3.5 py-3",
              primary ? "border-2 border-primary" : "border border-border",
            )}
          >
            <span
              aria-hidden="true"
              className="flex h-7 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface-subtle text-[10px] font-bold tracking-wide text-foreground"
            >
              {card.brand === "visa" ? "VISA" : "MC"}
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-bold text-foreground">
                <span className="sr-only">{card.brand === "visa" ? "Visa" : "Mastercard"} ending </span>
                <span aria-hidden="true">•••• </span>
                {card.last4}
              </span>
              <span className="block text-xs text-muted-foreground">{cardLine(card, variant)}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
