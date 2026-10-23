"use client";

import { useState } from "react";
import { JoinLessonButton, MINUTE, useDemoClock } from "@/components/lessons/JoinLessonButton";
import { RescheduleDialog } from "@/components/lessons/RescheduleDialog";
import { SetupCheck } from "@/components/lessons/SetupCheck";
import { Button } from "@/components/ui/button";
import { formatCountdown, formatLessonWhen } from "@/lib/format";
import type { BookingDay } from "@/lib/slots";

type NextLessonHeroProps = {
  lessonId: string;
  title: string;
  /** "Today, 17:00–18:00 · Ms. Kagiso Molefe · BGCSE Maths" */
  timeLine: string;
  goal?: string;
  start: string;
  durationMin: number;
  now: string;
  tutorName: string;
  rescheduleDays: BookingDay[];
};

export function NextLessonHero({
  lessonId,
  title,
  timeLine,
  goal,
  start,
  durationMin,
  now,
  tutorName,
  rescheduleDays,
}: NextLessonHeroProps) {
  const [rescheduling, setRescheduling] = useState(false);
  const clock = useDemoClock(now);
  const startMs = new Date(start).getTime();
  const nowMs = clock.getTime();
  const live = nowMs >= startMs && nowMs < startMs + durationMin * MINUTE;
  const eyebrow = live
    ? "Next lesson · Live now"
    : startMs - nowMs < 24 * 60 * MINUTE
      ? `Next lesson · ${formatCountdown(start, clock).eyebrow}`
      : `Next lesson · ${formatLessonWhen(start, clock.toISOString())}`;

  return (
    <section className="rounded-2xl bg-navy p-5 text-on-navy md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-[0.07em] text-brand-sky uppercase">{eyebrow}</p>
          <h2 className="mt-2 text-[24px] leading-tight font-bold text-on-navy">{title}</h2>
          <p className="mt-1.5 text-sm text-on-navy-muted">{timeLine}</p>
          {goal ? <p className="mt-1 text-[13px] text-on-navy-faint">Your goal: “{goal}”</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <JoinLessonButton lessonId={lessonId} start={start} durationMin={durationMin} now={now} />
            <Button variant="outline-navy" onClick={() => setRescheduling(true)}>
              Reschedule
            </Button>
          </div>
          <p className="mt-2 text-xs text-on-navy-faint">The join button opens 10 minutes before the lesson.</p>
        </div>
        <SetupCheck />
      </div>
      <RescheduleDialog
        open={rescheduling}
        onOpenChange={setRescheduling}
        lessonId={lessonId}
        tutorName={tutorName}
        days={rescheduleDays}
      />
    </section>
  );
}
