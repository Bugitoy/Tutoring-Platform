"use client";

import { Logo } from "@/components/shell/Logo";
import { dataNote } from "@/lib/room";
import type { VideoQuality } from "@/lib/types";
import { QualitySwitch } from "./QualitySwitch";

type RoomHeaderProps = {
  /** "Mathematics · Quadratics, part 2" */
  title: string;
  /** "BGCSE syllabus · 1:1 lesson with Ms. Kagiso Molefe" */
  subline: string;
  phoneTitle: string;
  /** "Ms. Kagiso Molefe · BGCSE Maths" */
  phoneSubline: string;
  elapsed: string;
  quality: VideoQuality;
  voiceOnly: boolean;
  onQualityChange: (quality: VideoQuality) => void;
};

function LiveBadge({ elapsed, compact }: { elapsed: string; compact?: boolean }) {
  return (
    <span
      role="timer"
      aria-label={`Live, ${elapsed} elapsed`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-status-live-bg px-2.5 py-[5px] text-xs font-bold text-status-live-fg tabular-nums"
    >
      <span className="size-1.5 rounded-full bg-status-live-dot" aria-hidden="true" />
      {compact ? elapsed : `Live · ${elapsed}`}
    </span>
  );
}

export function RoomHeader({
  title,
  subline,
  phoneTitle,
  phoneSubline,
  elapsed,
  quality,
  voiceOnly,
  onQualityChange,
}: RoomHeaderProps) {
  return (
    <header className="border-room-control sm:border-b">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-1 sm:hidden">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold">{phoneTitle}</h1>
          <p className="truncate text-[13px] text-room-muted">{phoneSubline}</p>
        </div>
        <LiveBadge elapsed={elapsed} compact />
      </div>

      <div className="hidden flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:flex">
        <Logo wordmarkClassName="text-room-text" />
        <span aria-hidden="true" className="h-8 w-px bg-room-control" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold">{title}</h1>
          <p className="truncate text-[13px] text-room-muted">{subline}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LiveBadge elapsed={elapsed} />
          <QualitySwitch quality={quality} voiceOnly={voiceOnly} onChange={onQualityChange} />
          <p aria-live="polite" className="text-xs text-room-muted">
            {dataNote(quality, voiceOnly)}
          </p>
        </div>
      </div>
    </header>
  );
}
