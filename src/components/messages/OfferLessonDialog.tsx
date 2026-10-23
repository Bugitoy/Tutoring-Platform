"use client";

import { useId, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import type { OfferInput } from "@/lib/types";
import type { OfferComposer } from "./types";

export type OfferDraft = { input: OfferInput; when: string; priceLine: string };

type OfferLessonDialogProps = OfferComposer & {
  disabled?: boolean;
  onPick: (draft: OfferDraft) => void;
};

function courseKey(course: { curriculumId: string; subjectId: string }) {
  return `${course.curriculumId}:${course.subjectId}`;
}

export function OfferLessonDialog({ recipientName, days, courses, disabled, onPick }: OfferLessonDialogProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const firstDay = days.find((day) => day.slots.length > 0);
  const [date, setDate] = useState(firstDay?.date ?? "");
  const [start, setStart] = useState(firstDay?.slots[0]?.start ?? "");
  const [course, setCourse] = useState(courses[0] ? courseKey(courses[0]) : "");

  const day = days.find((item) => item.date === date);
  const slot = day?.slots.find((item) => item.start === start);
  const picked = courses.find((item) => courseKey(item) === course);
  const empty = days.every((item) => item.slots.length === 0) || courses.length === 0;

  function pickDay(next: string) {
    setDate(next);
    setStart(days.find((item) => item.date === next)?.slots[0]?.start ?? "");
  }

  function add() {
    if (!day || !slot || !picked) return;
    onPick({
      input: { start: slot.start, durationMin: 60, curriculumId: picked.curriculumId, subjectId: picked.subjectId },
      when: `${day.label}, ${slot.range} · ${picked.label}`,
      priceLine: `${picked.price} · ${recipientName} can accept and pay by card in one tap`,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        disabled={disabled}
        aria-label="Offer a lesson time"
        className={cn(buttonVariants({ variant: "outline" }), "h-11 shrink-0 rounded-[10px] px-3")}
      >
        <CalendarPlus aria-hidden="true" />
        <span className="hidden sm:inline">Offer a lesson time</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-bold">Offer a lesson time</DialogTitle>
          <DialogDescription>
            {recipientName} gets a card in this chat and can accept and pay by card in one tap. Lessons are 60 minutes.
          </DialogDescription>
        </DialogHeader>

        {empty ? (
          <p className="text-sm text-muted-foreground">
            You have no free times in the next few days. Open more hours on your calendar first.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium text-foreground">Day</legend>
              <div className="flex flex-wrap gap-2">
                {days.map((item) => (
                  <button
                    key={item.date}
                    type="button"
                    aria-pressed={item.date === date}
                    disabled={item.slots.length === 0}
                    onClick={() => pickDay(item.date)}
                    className={cn(
                      "h-10 rounded-full px-3.5 text-[13px] transition-colors disabled:opacity-40",
                      item.date === date
                        ? "border-2 border-primary bg-accent font-bold text-primary"
                        : "border border-input bg-card font-medium text-text-secondary",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium text-foreground">Time</legend>
              <div className="flex flex-wrap gap-2">
                {(day?.slots ?? []).map((item) => (
                  <button
                    key={item.start}
                    type="button"
                    aria-pressed={item.start === start}
                    onClick={() => setStart(item.start)}
                    className={cn(
                      "h-10 rounded-full px-3.5 text-[13px] transition-colors",
                      item.start === start
                        ? "border-2 border-primary bg-accent font-bold text-primary"
                        : "border border-input bg-card font-medium text-text-secondary",
                    )}
                  >
                    {item.range}
                  </button>
                ))}
              </div>
            </fieldset>
            {courses.length > 1 ? (
              <div className="grid gap-1.5">
                <Label htmlFor={`${id}-course`}>Subject</Label>
                <Select value={course} onValueChange={(value) => setCourse(String(value))}>
                  <SelectTrigger id={`${id}-course`} className="h-11 w-full rounded-[10px]">
                    <span className="truncate">{picked?.label}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((item) => (
                      <SelectItem key={courseKey(item)} value={courseKey(item)}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                {picked?.label} · {picked?.price}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={add} disabled={empty || !slot || !picked}>
            Add to message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
