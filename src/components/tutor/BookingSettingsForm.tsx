"use client";

import { useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { updateBookingSettings } from "@/lib/actions/tutor";
import type { BookingSettings } from "@/lib/types";

const LENGTHS: { value: BookingSettings["lessonLength"]; label: string }[] = [
  { value: 60, label: "60 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 30, label: "30 minutes" },
];

const BREAKS: { value: BookingSettings["breakMin"]; label: string }[] = [
  { value: 15, label: "15 minutes" },
  { value: 0, label: "None" },
  { value: 30, label: "30 minutes" },
];

const AHEAD: { value: BookingSettings["bookAhead"]; label: string }[] = [
  { value: "2w", label: "2 weeks ahead" },
  { value: "1w", label: "1 week ahead" },
  { value: "1m", label: "1 month ahead" },
];

type Option<T> = { value: T; label: string };

function SettingSelect<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <span id={id} className="text-[13px] font-medium text-foreground">
        {label}
      </span>
      <Select
        value={String(value)}
        onValueChange={(next) => {
          const picked = options.find((option) => String(option.value) === String(next));
          if (picked) onChange(picked.value);
        }}
      >
        <SelectTrigger aria-labelledby={id} className="h-11 w-full rounded-[10px]">
          <span className="truncate">{options.find((option) => option.value === value)?.label}</span>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function BookingSettingsForm({ initial }: { initial: BookingSettings }) {
  const repeatId = useId();
  const [settings, setSettings] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save(next: BookingSettings) {
    setSettings(next);
    setSaved(false);
    startTransition(async () => {
      const result = await updateBookingSettings(next);
      if (result.ok) setSaved(true);
      else toast.error(result.error);
    });
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-bold text-foreground">Booking settings</h2>
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {isPending ? "Saving…" : saved ? "Saved" : ""}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <SettingSelect
          label="Lesson length"
          value={settings.lessonLength}
          options={LENGTHS}
          onChange={(lessonLength) => save({ ...settings, lessonLength })}
        />
        <SettingSelect
          label="Break between lessons"
          value={settings.breakMin}
          options={BREAKS}
          onChange={(breakMin) => save({ ...settings, breakMin })}
        />
        <SettingSelect
          label="Students can book up to"
          value={settings.bookAhead}
          options={AHEAD}
          onChange={(bookAhead) => save({ ...settings, bookAhead })}
        />
        <div className="flex items-start gap-3">
          <Checkbox
            id={repeatId}
            checked={settings.repeatWeekly}
            onCheckedChange={(checked) => save({ ...settings, repeatWeekly: checked === true })}
            className="mt-0.5"
          />
          <label htmlFor={repeatId} className="text-[13px] leading-snug text-foreground">
            Repeat my open slots every week
          </label>
        </div>
      </div>
    </section>
  );
}
