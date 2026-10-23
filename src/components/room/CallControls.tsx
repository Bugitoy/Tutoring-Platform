"use client";

import { MessageSquare, Mic, MicOff, MonitorUp, PhoneOff, Sparkles, Video, VideoOff } from "lucide-react";
import { cn } from "cn";

type CallControlsProps = {
  muted: boolean;
  voiceOnly: boolean;
  cameraOff: boolean;
  sharing: boolean;
  showHelper: boolean;
  onToggleMute: () => void;
  onToggleVoiceOnly: () => void;
  onToggleCamera: () => void;
  onToggleShare: () => void;
  onOpenHelper: () => void;
  onOpenChat: () => void;
  onLeave: () => void;
};

const control =
  "inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-room-control px-4 text-sm font-semibold text-room-text transition-colors hover:bg-room-self";
const round =
  "inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-room-control text-room-text transition-colors hover:bg-room-self";

export function CallControls({
  muted,
  voiceOnly,
  cameraOff,
  sharing,
  showHelper,
  onToggleMute,
  onToggleVoiceOnly,
  onToggleCamera,
  onToggleShare,
  onOpenHelper,
  onOpenChat,
  onLeave,
}: CallControlsProps) {
  const MicIcon = muted ? MicOff : Mic;
  const micLabel = muted ? "Unmute microphone" : "Mute microphone";

  return (
    <>
      <div role="group" aria-label="Call controls" className="hidden flex-wrap justify-center gap-3 px-4 py-4 sm:flex">
        <button
          type="button"
          aria-label={micLabel}
          onClick={onToggleMute}
          className={cn(control, "w-[52px] px-0", muted && "bg-destructive text-white hover:bg-destructive/90")}
        >
          <MicIcon aria-hidden="true" className="size-5" />
        </button>
        <button
          type="button"
          onClick={onToggleVoiceOnly}
          className={cn(control, voiceOnly && "bg-brand-sky text-brand-sky-foreground hover:bg-brand-sky/90")}
        >
          {voiceOnly ? <Video aria-hidden="true" className="size-5" /> : <VideoOff aria-hidden="true" className="size-5" />}
          {voiceOnly ? "Turn camera on" : "Switch to voice only"}
        </button>
        <button type="button" onClick={onToggleShare} className={control}>
          <MonitorUp aria-hidden="true" className="size-5" />
          {sharing ? "Stop sharing" : "Share screen"}
        </button>
        {showHelper ? (
          <button type="button" onClick={onOpenHelper} className={control}>
            <Sparkles aria-hidden="true" className="size-5" />
            Ask AI helper
          </button>
        ) : null}
        <button type="button" onClick={onOpenChat} className={control}>
          <MessageSquare aria-hidden="true" className="size-5" />
          Chat
        </button>
        <button type="button" onClick={onLeave} className={cn(control, "bg-destructive px-6 text-white hover:bg-destructive/90")}>
          <PhoneOff aria-hidden="true" className="size-5" />
          Leave lesson
        </button>
      </div>

      <div
        role="group"
        aria-label="Call controls"
        className="flex items-center justify-between gap-3 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:hidden"
      >
        <button
          type="button"
          aria-label={micLabel}
          onClick={onToggleMute}
          className={cn(round, muted && "bg-destructive text-white hover:bg-destructive/90")}
        >
          <MicIcon aria-hidden="true" className="size-6" />
        </button>
        {/* TODO(spec): the phone camera button isn't described; it turns your own camera off without pausing video. */}
        <button
          type="button"
          aria-label="Camera off"
          aria-pressed={cameraOff}
          disabled={voiceOnly}
          onClick={onToggleCamera}
          className={cn(round, "disabled:opacity-50", cameraOff && "bg-room-self")}
        >
          {cameraOff ? <VideoOff aria-hidden="true" className="size-6" /> : <Video aria-hidden="true" className="size-6" />}
        </button>
        <button
          type="button"
          aria-pressed={voiceOnly}
          onClick={onToggleVoiceOnly}
          className={cn(
            "inline-flex h-14 flex-1 items-center justify-center rounded-full bg-room-control px-5 text-[15px] font-semibold text-room-text",
            voiceOnly && "bg-brand-sky text-brand-sky-foreground",
          )}
        >
          Voice only
        </button>
        <button
          type="button"
          aria-label="Leave lesson"
          onClick={onLeave}
          className={cn(round, "bg-destructive text-white hover:bg-destructive/90")}
        >
          <PhoneOff aria-hidden="true" className="size-6" />
        </button>
      </div>
    </>
  );
}
