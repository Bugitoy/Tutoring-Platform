"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Excalidraw, FONT_FAMILY, convertToExcalidrawElements, getSceneVersion } from "@excalidraw/excalidraw";
import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw/data/transform";
import type { AppState, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";
import "./whiteboard.css";
import { WHITEBOARD_GRID_PX } from "@/config/room";
import type { WhiteboardPage } from "@/lib/types";

export type WhiteboardTool = "pen" | "text" | "shapes";

export type WhiteboardCanvasProps = {
  board?: WhiteboardPage;
  /** "Ms. Molefe" — the other person's cursor label. */
  partnerLabel: string;
  tool: WhiteboardTool | null;
  /** A CSS variable from INK_COLOURS. */
  ink: string;
  grid: boolean;
  onToolChange: (tool: WhiteboardTool | null) => void;
  onEdit: () => void;
};

const EXCALIDRAW_TOOL = { pen: "freedraw", text: "text", shapes: "rectangle" } as const;

function toolFromExcalidraw(type: AppState["activeTool"]["type"]): WhiteboardTool | null {
  if (type === "freedraw") return "pen";
  if (type === "text") return "text";
  if (type === "rectangle" || type === "ellipse" || type === "diamond") return "shapes";
  return null;
}

function cssColour(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

/** Where the other person is drawing, in scene coordinates: just right of the second line. */
const PARTNER_POINTER = { x: 230, y: 58 };

const TONE_VARIABLE = { ink: "--foreground", work: "--primary", answer: "--cat-2" } as const;

/** Lines of working on the left, then the parabola y = (x − 2)(x − 3) with its roots marked. */
function boardElements(board: WhiteboardPage): ExcalidrawElementSkeleton[] {
  const ink = cssColour("--foreground");
  const accent = cssColour("--cat-2");
  const muted = cssColour("--muted-foreground");
  const elements: Record<string, unknown>[] = [];

  board.lines.forEach((line, index) => {
    elements.push({
      type: "text",
      x: 16,
      y: 16 + index * 40,
      text: line.text,
      fontSize: index === 0 ? 24 : 20,
      fontFamily: FONT_FAMILY.Helvetica,
      strokeColor: cssColour(TONE_VARIABLE[line.tone]),
    });
  });
  const last = board.lines.length - 1;
  if (last > 0) {
    elements.push({
      type: "line",
      x: 16,
      y: 16 + last * 40 + 30,
      points: [[0, 0], [88, 3], [176, 1]],
      strokeColor: accent,
      strokeWidth: 2,
      roughness: 0,
    });
  }

  if (board.graph) {
    const top = 16 + board.lines.length * 40 + 12;
    const originX = 80;
    const axisY = top + 150;
    const unit = 50;
    const curve: [number, number][] = [];
    for (let step = 0; step <= 34; step += 1) {
      const x = 0.8 + step * 0.1;
      curve.push([x * unit, -(x - 2) * (x - 3) * unit]);
    }
    const [firstX, firstY] = curve[0];
    elements.push(
      { type: "line", x: originX, y: top, points: [[0, 0], [0, 175]], strokeColor: ink, strokeWidth: 1, roughness: 0 },
      { type: "line", x: originX - 40, y: axisY, points: [[0, 0], [320, 0]], strokeColor: ink, strokeWidth: 1, roughness: 0 },
      {
        type: "line",
        x: originX + firstX,
        y: axisY + firstY,
        points: curve.map(([x, y]) => [x - firstX, y - firstY]),
        strokeColor: ink,
        strokeWidth: 2,
        roughness: 0,
      },
    );
    for (const root of [2, 3]) {
      elements.push(
        {
          type: "ellipse",
          x: originX + root * unit - 5,
          y: axisY - 5,
          width: 10,
          height: 10,
          strokeColor: accent,
          backgroundColor: accent,
          fillStyle: "solid",
        },
        {
          type: "text",
          x: originX + root * unit - 4,
          y: axisY + 10,
          text: String(root),
          fontSize: 14,
          fontFamily: FONT_FAMILY.Helvetica,
          strokeColor: accent,
        },
      );
    }
    elements.push({
      type: "text",
      x: originX + 4.4 * unit,
      y: axisY - 100,
      text: "roots = where\nit crosses the x-axis",
      fontSize: 14,
      fontFamily: FONT_FAMILY.Helvetica,
      strokeColor: muted,
    });
  }
  return elements as unknown as ExcalidrawElementSkeleton[];
}

export default function WhiteboardCanvas({
  board,
  partnerLabel,
  tool,
  ink,
  grid,
  onToolChange,
  onEdit,
}: WhiteboardCanvasProps) {
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const toolRef = useRef<WhiteboardTool | null>(tool);
  const versionRef = useRef<number | null>(null);

  const [initialData] = useState(() => ({
    elements: board ? convertToExcalidrawElements(boardElements(board)) : [],
    appState: {
      viewBackgroundColor: "transparent",
      currentItemFontFamily: FONT_FAMILY.Helvetica,
      currentItemStrokeColor: cssColour(ink),
      currentItemRoughness: 0,
    },
  }));

  useEffect(() => {
    if (!api || !tool) return;
    toolRef.current = tool;
    api.setActiveTool({ type: EXCALIDRAW_TOOL[tool] });
  }, [api, tool]);

  useEffect(() => {
    api?.updateScene({ appState: { currentItemStrokeColor: cssColour(ink) } });
  }, [api, ink]);

  const followCanvas = useCallback((scrollX: number, scrollY: number, zoom: number) => {
    const paper = gridRef.current;
    if (paper) {
      const size = WHITEBOARD_GRID_PX * zoom;
      paper.style.backgroundSize = `${size}px ${size}px`;
      paper.style.backgroundPosition = `${scrollX * zoom}px ${scrollY * zoom}px`;
    }
    const cursor = cursorRef.current;
    if (cursor) {
      cursor.style.transform = `translate(${(PARTNER_POINTER.x + scrollX) * zoom}px, ${(PARTNER_POINTER.y + scrollY) * zoom}px)`;
    }
  }, []);

  useEffect(() => {
    if (!api) return;
    const { scrollX, scrollY, zoom } = api.getAppState();
    followCanvas(scrollX, scrollY, zoom.value);
  }, [api, followCanvas]);

  return (
    <div ref={gridRef} data-grid={grid ? "on" : "off"} className="thanodi-whiteboard relative h-full w-full overflow-hidden">
      {/* TODO(spec): the partner's cursor moves with their real pointer once Stream is connected. */}
      <span
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-10 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-primary-foreground"
      >
        {partnerLabel}
      </span>
      <Excalidraw
        excalidrawAPI={setApi}
        initialData={initialData}
        theme="light"
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
            clearCanvas: false,
            export: false,
            loadScene: false,
            saveToActiveFile: false,
            toggleTheme: null,
            saveAsImage: false,
          },
          tools: { image: false },
        }}
        onScrollChange={(scrollX, scrollY, zoom) => followCanvas(scrollX, scrollY, zoom.value)}
        onChange={(elements, appState) => {
          const next = toolFromExcalidraw(appState.activeTool.type);
          if (next !== toolRef.current) {
            toolRef.current = next;
            onToolChange(next);
          }
          const version = getSceneVersion(elements);
          if (versionRef.current !== null && version !== versionRef.current) onEdit();
          versionRef.current = version;
        }}
      />
    </div>
  );
}
