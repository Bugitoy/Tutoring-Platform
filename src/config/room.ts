import type { VideoQuality } from "@/lib/types";

export type RoomMode = VideoQuality | "voice_only";

export const QUALITY_OPTIONS: { value: VideoQuality; label: string }[] = [
  { value: "hd", label: "HD" },
  { value: "auto", label: "Auto" },
  { value: "data_saver", label: "Data saver" },
];

/** Estimates only; shown next to the quality switch so learners can budget their data. */
export const DATA_NOTES: Record<RoomMode, string> = {
  hd: "HD video · est. 1.2 GB per hour",
  auto: "Auto quality · adjusts to your connection",
  data_saver: "Data saver · est. 300 MB per hour",
  voice_only: "Voice only · est. 40 MB per hour",
};

/** The phone layout has no room for the note, so the video corner says what's on. */
export const MODE_BADGES: Record<RoomMode, string> = {
  hd: "HD on",
  auto: "Auto quality",
  data_saver: "Data saver on",
  voice_only: "Voice only",
};

/** Whiteboard inks, as CSS variables; Excalidraw needs the resolved colours at runtime. */
export const INK_COLOURS = [
  { variable: "--foreground", label: "Black ink" },
  { variable: "--primary", label: "Blue ink" },
  { variable: "--cat-2", label: "Orange ink" },
] as const;

export const WHITEBOARD_GRID_PX = 24;
