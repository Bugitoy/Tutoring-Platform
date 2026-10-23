"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { StatusPill } from "@/components/shared/StatusPill";
import { Button, buttonVariants } from "@/components/ui/button";
import { completeHomework } from "@/lib/actions/lessons";

type HomeworkCardProps = {
  lessonId: string;
  /** "HOMEWORK · DUE SAT 24 OCT" */
  eyebrow: string;
  task: string;
  minutes?: number;
  done: boolean;
  pastPaperHref: string;
};

export function HomeworkCard({ lessonId, eyebrow, task, minutes, done, pastPaperHref }: HomeworkCardProps) {
  const [isDone, setDone] = useOptimistic(done);
  const [, startTransition] = useTransition();

  function markDone() {
    startTransition(async () => {
      setDone(true);
      try {
        await completeHomework(lessonId);
      } catch {
        toast.error("Could not save that. Try again.");
      }
    });
  }

  return (
    <section className="rounded-xl border-2 border-highlight-border bg-card p-5">
      <p className="text-xs font-bold tracking-[0.07em] text-status-warning-fg uppercase">{eyebrow}</p>
      <h2 className="mt-1.5 text-[17px] font-bold text-foreground">{task}</h2>
      {minutes ? <p className="mt-1 text-[13px] text-muted-foreground">About {minutes} minutes</p> : null}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href={pastPaperHref} className={buttonVariants()}>
          Open past paper
        </Link>
        {isDone ? (
          <StatusPill tone="success">Homework done</StatusPill>
        ) : (
          <Button variant="outline" onClick={markDone}>
            Mark as done
          </Button>
        )}
      </div>
    </section>
  );
}
