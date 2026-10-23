"use client";

import { Mic, MicOff, MonitorUp, Signal, User, VideoOff } from "lucide-react";
import { cn } from "cn";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { dataNote, modeBadge, type ConnectionQuality } from "@/lib/room";
import type { VideoQuality } from "@/lib/types";
import { QualitySwitch } from "./QualitySwitch";

type Person = { name: string; shortName: string; initials: string };

type VideoStageProps = {
  remote: Person;
  self: Person & { label: string };
  voiceOnly: boolean;
  muted: boolean;
  cameraOff: boolean;
  sharing: boolean;
  connection: ConnectionQuality;
  quality: VideoQuality;
  onQualityChange: (quality: VideoQuality) => void;
  className?: string;
};

const tag = "inline-flex items-center gap-1.5 rounded-md bg-room-bg/80 px-2.5 py-1 text-xs font-medium text-room-text";

function VoiceOnlyStage({ remote, self, muted }: Pick<VideoStageProps, "remote" | "self" | "muted">) {
  const people = [
    { person: remote, speaking: true, label: "Speaking" },
    { person: self, speaking: false, label: muted ? "Muted" : "Listening" },
  ];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 pt-4 pb-12 text-center sm:gap-6 sm:p-6">
      <ul className="flex items-start gap-6 sm:gap-10">
        {people.map(({ person, speaking, label }) => (
          <li key={person.name} className="flex flex-col items-center gap-2">
            <span
              aria-hidden="true"
              className={cn(
                "flex size-16 items-center justify-center rounded-full bg-room-self text-xl font-bold text-room-text sm:size-[140px] sm:text-4xl",
                speaking && "ring-4 ring-room-good",
              )}
            >
              {person.initials}
            </span>
            <span className="text-sm font-semibold">{person.shortName}</span>
            <span className={cn("-mt-1.5 text-xs", speaking ? "text-room-good" : "text-room-muted")}>{label}</span>
          </li>
        ))}
      </ul>
      <div className="max-w-sm">
        <p className="text-base font-bold">Voice-only mode</p>
        <p className="mt-1 text-[13px] text-room-muted sm:text-sm">
          Video is paused to save data. The whiteboard and chat keep working. Turn your camera back on any time.
        </p>
      </div>
    </div>
  );
}

// TODO(spec): video tiles show placeholders until Stream is connected.
export function VideoStage({
  remote,
  self,
  voiceOnly,
  muted,
  cameraOff,
  sharing,
  connection,
  quality,
  onQualityChange,
  className,
}: VideoStageProps) {
  return (
    <section
      aria-label={voiceOnly ? "Voice call" : `Video call with ${remote.name}`}
      className={cn(
        "relative h-[300px] shrink-0 overflow-hidden rounded-2xl bg-room-video sm:h-auto sm:min-h-[420px] lg:min-h-[560px]",
        className,
      )}
    >
      {voiceOnly ? (
        <VoiceOnlyStage remote={remote} self={self} muted={muted} />
      ) : (
        <>
          <div className="flex h-full items-center justify-center">
            <User aria-hidden="true" strokeWidth={1.5} className="size-36 text-room-self sm:size-44" />
          </div>

          <div
            className="absolute top-3 right-3 flex h-32 w-24 items-center justify-center overflow-hidden rounded-xl border-2 border-room-bg bg-room-self sm:h-[140px] sm:w-[220px]"
            aria-label={`${self.label}${cameraOff ? ", camera off" : ""}${muted ? ", muted" : ""}`}
            role="img"
          >
            {cameraOff ? (
              <VideoOff aria-hidden="true" className="size-6 text-room-muted" />
            ) : (
              <User aria-hidden="true" strokeWidth={1.5} className="size-10 text-room-muted sm:size-12" />
            )}
            <span className={cn(tag, "absolute bottom-2 left-2 px-2 py-0.5 text-[11px]")}>
              {muted ? <MicOff aria-hidden="true" className="size-3 text-status-live-dot" /> : null}
              <span className="sm:hidden">You</span>
              <span className="hidden sm:inline">{self.label}</span>
            </span>
          </div>

          {sharing ? (
            <span className={cn(tag, "absolute top-3 left-3")}>
              <MonitorUp aria-hidden="true" className="size-3.5 text-room-good" />
              You’re sharing your screen
            </span>
          ) : null}
        </>
      )}

      {voiceOnly ? null : (
        <span className={cn(tag, "absolute bottom-3 left-3")}>
          <Mic aria-hidden="true" className="size-3.5 text-room-good" />
          <span className="hidden sm:inline">{remote.name}</span>
          <span className="sm:hidden">{remote.shortName}</span>
        </span>
      )}

      <span className={cn(tag, "absolute right-3 bottom-3 hidden sm:inline-flex")}>
        <Signal aria-hidden="true" className={cn("size-3.5", connection === "good" ? "text-room-good" : "text-room-fair")} />
        {connection === "good" ? "Good connection" : "Fair connection"}
      </span>

      {/* TODO(spec): the phone design has no quality switch; the corner badge opens it. */}
      <Popover>
        <PopoverTrigger className={cn(tag, "absolute right-3 bottom-3 min-h-8 sm:hidden")}>
          {modeBadge(quality, voiceOnly)}
          <span className="sr-only">, change video quality</span>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-auto gap-2 bg-room-panel text-room-text ring-room-control">
          <QualitySwitch quality={quality} voiceOnly={voiceOnly} onChange={onQualityChange} />
          <p className="text-xs text-room-muted">{dataNote(quality, voiceOnly)}</p>
        </PopoverContent>
      </Popover>
    </section>
  );
}
