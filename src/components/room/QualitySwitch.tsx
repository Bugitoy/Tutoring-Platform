"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { QUALITY_OPTIONS } from "@/config/room";
import type { VideoQuality } from "@/lib/types";

type QualitySwitchProps = {
  quality: VideoQuality;
  /** In voice-only mode no quality is active; picking one turns video back on. */
  voiceOnly: boolean;
  onChange: (quality: VideoQuality) => void;
};

export function QualitySwitch({ quality, voiceOnly, onChange }: QualitySwitchProps) {
  const pressed = voiceOnly ? [] : [quality];
  return (
    <ToggleGroup
      aria-label="Video quality"
      value={pressed}
      onValueChange={(next) => {
        const picked = next.find((item) => !pressed.includes(item as VideoQuality));
        if (picked) onChange(picked as VideoQuality);
      }}
      spacing={2}
      className="flex rounded-lg bg-room-panel p-1"
    >
      {QUALITY_OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className="h-8 rounded-md border-0 bg-transparent px-3 text-xs font-semibold text-room-text hover:bg-room-control hover:text-room-text aria-pressed:bg-brand-sky aria-pressed:text-brand-sky-foreground"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
