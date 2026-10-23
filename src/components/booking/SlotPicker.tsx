"use client";

import { cn } from "cn";
import type { BookingDay } from "@/lib/slots";

type SlotPickerProps = {
  days: BookingDay[];
  start: string | null;
  onStartChange: (start: string) => void;
  goal?: string;
  onGoalChange?: (goal: string) => void;
};

export function SlotPicker({ days, start, goal, onStartChange, onGoalChange }: SlotPickerProps) {
  const selectedDay = days.find((day) => day.slots.some((slot) => slot.start === start)) ?? days[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2">
        {days.map((day) => {
          const selected = day.date === selectedDay?.date;
          return (
            <button
              key={day.date}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                const open = day.slots.find((slot) => slot.state === "open") ?? day.slots[0];
                if (open && open.state === "open") onStartChange(open.start);
              }}
              className={cn(
                "flex h-16 flex-col items-center justify-center rounded-xl text-sm",
                selected
                  ? "border-2 border-primary bg-accent font-bold text-primary"
                  : "border border-input bg-card font-semibold text-foreground",
              )}
            >
              <span>{day.weekday}</span>
              <span>{day.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedDay?.slots.map((slot) => {
          const selected = slot.start === start;
          const blocked = slot.state !== "open";
          return (
            <button
              key={slot.start}
              type="button"
              aria-pressed={selected}
              disabled={blocked}
              onClick={() => onStartChange(slot.start)}
              className={cn(
                "inline-flex h-11 items-center rounded-xl px-3 text-sm",
                selected && "border-2 border-primary bg-accent font-bold text-primary",
                !selected && slot.state === "open" && "border border-input bg-card font-semibold text-foreground",
                slot.state === "booked" && "border border-dashed border-input font-medium text-muted-foreground",
                slot.state === "past" && "border border-input font-medium text-text-faint",
              )}
            >
              {slot.state === "booked" ? `${slot.time} · booked` : slot.time}
            </button>
          );
        })}
      </div>
      {onGoalChange ? (
        <label className="text-sm font-medium text-foreground">
          What do you want to cover?
          <input
            value={goal ?? ""}
            onChange={(event) => onGoalChange(event.target.value)}
            placeholder="Factorising quadratics before Friday’s test"
            className="mt-1.5 h-11 w-full rounded-[10px] border border-input bg-card px-3 text-sm font-normal text-foreground outline-none placeholder:text-text-faint focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
      ) : null}
    </div>
  );
}
