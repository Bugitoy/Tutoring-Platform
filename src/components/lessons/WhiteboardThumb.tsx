import { cn } from "cn";
import type { WhiteboardPage } from "@/lib/types";

const TONE_CLASS = {
  ink: "text-foreground",
  work: "text-primary",
  answer: "text-cat-2",
} as const;

function ParabolaSketch() {
  return (
    <svg viewBox="0 0 160 90" className="h-full w-full" aria-hidden="true">
      <line x1="16" y1="70" x2="144" y2="70" className="stroke-foreground" strokeWidth="1" />
      <path d="M50 8 Q80 120 110 8" className="fill-none stroke-foreground" strokeWidth="1.5" />
      <circle cx="69" cy="70" r="3" className="fill-cat-2" />
      <circle cx="91" cy="70" r="3" className="fill-cat-2" />
    </svg>
  );
}

export function WhiteboardThumb({ page }: { page: WhiteboardPage }) {
  const description = page.graph ? "a parabola crossing the x-axis at two points" : page.lines.map((line) => line.text).join(", ");
  return (
    <figure className="flex flex-col gap-1.5">
      <div
        role="img"
        aria-label={`${page.caption}: ${description}`}
        className="flex aspect-[16/10] flex-col justify-center gap-1 rounded-lg border border-border bg-card bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:12px_12px] px-4"
      >
        {page.graph ? (
          <ParabolaSketch />
        ) : (
          page.lines.map((line) => (
            <span key={line.text} className={cn("text-[12px] font-semibold", TONE_CLASS[line.tone], line.tone !== "ink" && "font-medium")}>
              {line.text}
            </span>
          ))
        )}
      </div>
      <figcaption className="text-xs text-muted-foreground">{page.caption}</figcaption>
    </figure>
  );
}
