"use client";

import { useId, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { Avatar } from "@/components/shared/Avatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusPill, type StatusTone } from "@/components/shared/StatusPill";
import { PageHeader } from "@/components/shell/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { updateStudentNote } from "@/lib/actions/tutor";
import type { TopicProgress } from "@/lib/types";

type Pill = { label: string; tone: StatusTone };

export type PastReportRow = {
  lessonId: string;
  heading: string;
  when: string;
  attendance: Pill;
  comment: string;
  homework?: string;
};

export type StudentRow = {
  id: string;
  name: string;
  initials: string;
  parentName?: string;
  course: string;
  lessonsTogether: number;
  nextLesson?: string;
  homework: Pill;
  /** "Form 4 · BGCSE Maths · parent Masego Seretse" */
  summary: string;
  goal?: string;
  topics: TopicProgress[];
  privateNote: string;
  reports: PastReportRow[];
};

type StudentsWorkspaceProps = {
  subtitle: string;
  rows: StudentRow[];
};

function matches(row: StudentRow, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return row.name.toLowerCase().includes(needle) || (row.parentName ?? "").toLowerCase().includes(needle);
}

export function StudentsWorkspace({ subtitle, rows }: StudentsWorkspaceProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const shown = rows.filter((row) => matches(row, query));
  const selected = shown.find((row) => row.id === searchParams.get("student")) ?? shown[0];

  function setParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    const search = params.toString();
    window.history.replaceState(null, "", search ? `${pathname}?${search}` : pathname);
  }

  return (
    <>
      <PageHeader
        title="Students"
        subtitle={subtitle}
        actions={
          <div className="relative w-full sm:w-64">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              aria-label="Search by student or parent"
              placeholder="Search by student or parent"
              defaultValue={query}
              onChange={(event) => setParam("q", event.target.value)}
              className="h-11 rounded-[10px] bg-card pl-9"
            />
          </div>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section aria-label="Your students" className="overflow-hidden rounded-xl border border-border bg-card">
          {shown.length === 0 ? (
            <div className="p-5">
              <EmptyState title="No students match" description="Try another student or parent name." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-[13px]">
                <thead className="border-b border-border bg-surface-subtle text-[11px] font-bold tracking-[0.07em] text-muted-foreground uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-3">Student</th>
                    <th scope="col" className="px-3 py-3">Subject</th>
                    <th scope="col" className="px-3 py-3">Lessons</th>
                    <th scope="col" className="px-3 py-3">Next lesson</th>
                    <th scope="col" className="px-4 py-3">Homework</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {shown.map((row) => {
                    const isSelected = row.id === selected?.id;
                    return (
                      <tr key={row.id} className={cn("relative", isSelected ? "bg-accent" : "hover:bg-surface-subtle")}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar initials={row.initials} size={36} />
                            <div className="min-w-0">
                              <button
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => setParam("student", row.id)}
                                className="text-left text-sm font-semibold text-foreground after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-md focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
                              >
                                {row.name}
                              </button>
                              {row.parentName ? (
                                <p className="text-xs text-muted-foreground">Parent: {row.parentName}</p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-foreground">{row.course}</td>
                        <td className="px-3 py-3 text-foreground">{row.lessonsTogether}</td>
                        <td className="px-3 py-3 text-foreground">{row.nextLesson ?? "Not booked"}</td>
                        <td className="px-4 py-3">
                          <StatusPill tone={row.homework.tone} className="whitespace-nowrap">
                            {row.homework.label}
                          </StatusPill>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selected ? <StudentPanel key={selected.id} row={selected} /> : null}
      </div>
    </>
  );
}

function StudentPanel({ row }: { row: StudentRow }) {
  const noteId = useId();
  const [note, setNote] = useState(row.privateNote);
  const [savedNote, setSavedNote] = useState(row.privateNote);
  const [justSaved, setJustSaved] = useState(false);
  const [isSaving, startTransition] = useTransition();

  function saveNote() {
    if (note === savedNote) return;
    const next = note;
    startTransition(async () => {
      const result = await updateStudentNote(row.id, next);
      if (result.ok) {
        setSavedNote(next);
        setJustSaved(true);
      } else toast.error(result.error);
    });
  }

  return (
    <section aria-label={`${row.name} details`} className="rounded-xl border-2 border-primary bg-card p-5">
      <header className="flex items-center gap-3">
        <Avatar initials={row.initials} size={44} />
        <div className="min-w-0">
          <h2 className="text-[17px] font-bold text-foreground">{row.name}</h2>
          <p className="text-xs text-muted-foreground">{row.summary}</p>
        </div>
      </header>

      {row.goal ? (
        <div className="mt-4 rounded-lg bg-surface-subtle p-3">
          <p className="text-[11px] font-bold tracking-[0.07em] text-muted-foreground uppercase">Goal set by parent</p>
          <p className="mt-1 text-[13px] text-foreground">{row.goal}</p>
        </div>
      ) : null}

      <h3 className="mt-4 text-sm font-bold text-foreground">Topic progress</h3>
      {row.topics.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-3">
          {row.topics.map((topic) => (
            <li key={topic.topic}>
              <div className="flex justify-between gap-3 text-xs">
                <span className="text-foreground">{topic.topic}</span>
                <span className="font-medium text-foreground">{topic.label}</span>
              </div>
              <Progress
                value={topic.percent}
                aria-label={`${topic.topic}: ${topic.label}`}
                className="mt-1.5 gap-0 [&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-border"
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-[13px] text-muted-foreground">No topic progress recorded yet.</p>
      )}

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <label htmlFor={noteId} className="text-[13px] font-medium text-foreground">
          Private notes (only you see these)
        </label>
        <span aria-live="polite" className="text-xs text-muted-foreground">
          {isSaving ? "Saving…" : justSaved ? "Saved" : ""}
        </span>
      </div>
      <Textarea
        id={noteId}
        value={note}
        maxLength={2000}
        onChange={(event) => {
          setNote(event.target.value);
          setJustSaved(false);
        }}
        onBlur={saveNote}
        placeholder="Anything that helps you teach them, e.g. how they learn best."
        className="mt-1.5 min-h-20 rounded-[10px] bg-card"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/tutor/messages" className={buttonVariants()}>
          Message parent
        </Link>
        <Link href="/tutor/messages" className={buttonVariants({ variant: "outline" })}>
          Offer a lesson time
        </Link>
        <PastReportsDialog row={row} />
      </div>
    </section>
  );
}

function PastReportsDialog({ row }: { row: StudentRow }) {
  return (
    <Dialog>
      <DialogTrigger className={buttonVariants({ variant: "outline" })}>Past reports</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-bold">Past reports · {row.name}</DialogTitle>
          <DialogDescription>
            {row.reports.length > 0
              ? "What you’ve sent the family after each lesson, newest first."
              : "You haven’t sent a report for this student yet."}
          </DialogDescription>
        </DialogHeader>
        {row.reports.length > 0 ? (
          <ol className="flex flex-col gap-3">
            {row.reports.map((report) => (
              <li key={report.lessonId} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">{report.heading}</p>
                    <p className="text-xs text-muted-foreground">{report.when}</p>
                  </div>
                  <StatusPill tone={report.attendance.tone} className="shrink-0">
                    {report.attendance.label}
                  </StatusPill>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-foreground">{report.comment}</p>
                {report.homework ? (
                  <p className="mt-1.5 text-[13px] text-foreground">
                    <strong>Homework:</strong> {report.homework}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
