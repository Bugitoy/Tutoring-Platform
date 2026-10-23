"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Video } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

const JOIN_OPENS_MIN = 10;
export const MINUTE = 60_000;

/** The demo clock, moving on in real time while the page stays open. */
export function useDemoClock(now: string): Date {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const mounted = Date.now();
    const timer = setInterval(() => setElapsed(Date.now() - mounted), MINUTE);
    return () => clearInterval(timer);
  }, []);
  return new Date(new Date(now).getTime() + elapsed);
}

type JoinLessonButtonProps = {
  lessonId: string;
  start: string;
  durationMin: number;
  now: string;
};

/** Opens 10 minutes before the start and stays open until the lesson ends. */
export function JoinLessonButton({ lessonId, start, durationMin, now }: JoinLessonButtonProps) {
  const clock = useDemoClock(now).getTime();
  const startMs = new Date(start).getTime();
  const open = clock >= startMs - JOIN_OPENS_MIN * MINUTE && clock < startMs + durationMin * MINUTE;

  if (open) {
    return (
      <Link href={`/lesson/${lessonId}`} className={buttonVariants({ variant: "accent-navy" })}>
        <Video aria-hidden="true" />
        Join video lesson
      </Link>
    );
  }
  return (
    <Button variant="accent-navy" disabled>
      <Video aria-hidden="true" />
      Join video lesson
    </Button>
  );
}
