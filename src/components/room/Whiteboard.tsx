"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ChartSpline, Pencil, Shapes, Type, type LucideIcon } from "lucide-react";
import { cn } from "cn";
import { INK_COLOURS } from "@/config/room";
import type { WhiteboardPage } from "@/lib/types";
import type { WhiteboardTool } from "./WhiteboardCanvas";

const WhiteboardCanvas = dynamic(() => import("./WhiteboardCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading whiteboard…</div>
  ),
});

const TOOLS: { value: WhiteboardTool; label: string; icon: LucideIcon }[] = [
  { value: "pen", label: "Pen", icon: Pencil },
  { value: "text", label: "Text", icon: Type },
  { value: "shapes", label: "Shapes", icon: Shapes },
];

const INK_SWATCH: Record<(typeof INK_COLOURS)[number]["variable"], string> = {
  "--foreground": "bg-foreground",
  "--primary": "bg-primary",
  "--cat-2": "bg-cat-2",
};

type WhiteboardProps = {
  board?: WhiteboardPage;
  partnerLabel: string;
};

const toolButton =
  "flex size-8 items-center justify-center rounded-lg border text-foreground transition-colors hover:bg-muted focus-visible:outline-2";

// TODO(spec): the whiteboard isn't stored yet; "Saved to lesson notes" reflects local edits until it is.
export function Whiteboard({ board, partnerLabel }: WhiteboardProps) {
  const [tool, setTool] = useState<WhiteboardTool | null>("pen");
  const [ink, setInk] = useState<string>(INK_COLOURS[0].variable);
  const [grid, setGrid] = useState(true);
  const [saving, setSaving] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function edited() {
    setSaving(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSaving(false), 800);
  }

  const description = board
    ? `${board.lines.map((line) => line.text).join(", ")}${board.graph ? ", and a parabola crossing the x-axis at 2 and 3" : ""}.`
    : "The whiteboard is empty.";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        role="toolbar"
        aria-label="Whiteboard tools"
        className="hidden flex-wrap items-center gap-1 border-b border-border px-3 py-2 sm:flex"
      >
        {TOOLS.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-label={item.label}
            aria-pressed={tool === item.value}
            onClick={() => setTool(item.value)}
            className={cn(
              toolButton,
              tool === item.value ? "border-primary bg-accent text-primary" : "border-border bg-card",
            )}
          >
            <item.icon aria-hidden="true" className="size-4" />
          </button>
        ))}
        <button
          type="button"
          aria-label="Graph paper"
          aria-pressed={grid}
          onClick={() => setGrid((current) => !current)}
          className={cn(toolButton, grid ? "border-primary bg-accent text-primary" : "border-border bg-card")}
        >
          <ChartSpline aria-hidden="true" className="size-4" />
        </button>
        <span aria-hidden="true" className="mx-1 h-6 w-px bg-border" />
        <div role="radiogroup" aria-label="Ink colour" className="flex items-center gap-0.5">
          {INK_COLOURS.map((colour) => (
            <button
              key={colour.variable}
              type="button"
              role="radio"
              aria-checked={ink === colour.variable}
              aria-label={colour.label}
              onClick={() => setInk(colour.variable)}
              className={cn(
                "flex size-7 items-center justify-center rounded-full",
                ink === colour.variable && "ring-2 ring-foreground ring-inset",
              )}
            >
              <span aria-hidden="true" className={cn("size-[18px] rounded-full", INK_SWATCH[colour.variable])} />
            </button>
          ))}
        </div>
        <p aria-live="polite" className="ml-auto text-xs text-muted-foreground">
          {saving ? "Saving…" : "Saved to lesson notes"}
        </p>
      </div>

      <div role="region" aria-label="Shared whiteboard" className="relative min-h-0 flex-1">
        <p className="sr-only">On the whiteboard: {description}</p>
        <span className="pointer-events-none absolute top-3 right-3 z-10 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground sm:hidden">
          Pinch to zoom
        </span>
        <WhiteboardCanvas
          board={board}
          partnerLabel={partnerLabel}
          tool={tool}
          ink={ink}
          grid={grid}
          onToolChange={setTool}
          onEdit={edited}
        />
      </div>
    </div>
  );
}
