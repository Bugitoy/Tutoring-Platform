"use client";

import { useState } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusPill, type StatusTone } from "@/components/shared/StatusPill";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

export type ResourceRow = {
  id: string;
  kind: "pdf" | "img";
  title: string;
  /** "BGCSE Maths" — also what the course select filters on. */
  course: string;
  /** "BGCSE Maths · used in 6 lessons · updated 20 Oct" */
  meta: string;
  pill?: { label: string; tone: StatusTone };
};

type TabId = "mine" | "shared" | "syllabus";

type ResourcesWorkspaceProps = {
  mine: ResourceRow[];
  shared: ResourceRow[];
  syllabus: ResourceRow[];
  /** "your 17:00 lesson today with Neo Seretse" */
  nextLesson?: string;
};

const ALL = "all";

export function ResourcesWorkspace({ mine, shared, syllabus, nextLesson }: ResourcesWorkspaceProps) {
  const [tab, setTab] = useState<TabId>("mine");
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState(ALL);

  const tabs: { id: TabId; label: string; rows: ResourceRow[]; empty: string }[] = [
    { id: "mine", label: `My resources · ${mine.length}`, rows: mine, empty: "Upload a worksheet or slide to use it in your lessons." },
    { id: "shared", label: "Shared by tutors", rows: shared, empty: "No other tutors are selling resources for your courses yet." },
    { id: "syllabus", label: "Syllabus documents", rows: syllabus, empty: "No syllabus documents for your courses yet." },
  ];
  const courses = [...new Set([...mine, ...shared, ...syllabus].map((row) => row.course))].sort();
  const needle = query.trim().toLowerCase();

  function addToLesson(row: ResourceRow) {
    toast.success(`“${row.title}” is ready to open in ${nextLesson ?? "your next lesson"}.`);
  }

  return (
    <Tabs.Root value={tab} onValueChange={(value) => setTab(value as TabId)} className="flex flex-col gap-4">
      <Tabs.List
        aria-label="Resource sources"
        className="flex w-full flex-wrap gap-1 self-start rounded-xl border border-border bg-card p-1 sm:w-auto"
      >
        {tabs.map((item) => (
          <Tabs.Tab
            key={item.id}
            value={item.id}
            className="h-9 flex-1 rounded-lg px-3 text-[13px] font-medium whitespace-nowrap text-text-secondary transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none data-active:bg-primary data-active:font-semibold data-active:text-primary-foreground sm:flex-none"
          >
            {item.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Search resources"
            placeholder={tab === "mine" ? "Search your resources" : "Search resources"}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 rounded-[10px] bg-card pl-9"
          />
        </div>
        <Select value={course} onValueChange={(value) => setCourse(String(value))}>
          <SelectTrigger aria-label="Syllabus" className="h-11 w-full rounded-[10px] bg-card sm:w-48">
            <span className="truncate">{course === ALL ? "All syllabuses" : course}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All syllabuses</SelectItem>
            {courses.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {tabs.map((item) => {
        const rows = item.rows.filter(
          (row) => (course === ALL || row.course === course) && (!needle || row.title.toLowerCase().includes(needle)),
        );
        const filtered = rows.length === 0 && item.rows.length > 0;
        return (
          <Tabs.Panel key={item.id} value={item.id} className="outline-none">
            {rows.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <EmptyState
                  title={filtered ? "Nothing matches" : "Nothing here yet"}
                  description={filtered ? "Try another search or syllabus." : item.empty}
                />
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-border bg-card p-4 sm:flex-nowrap"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-[11px] font-bold text-primary uppercase"
                    >
                      {row.kind}
                    </span>
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="text-[15px] font-semibold text-foreground">
                        {row.title}
                        <span className="sr-only">, {row.kind === "pdf" ? "PDF" : "image"}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{row.meta}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {row.pill ? (
                        <StatusPill tone={row.pill.tone} className="whitespace-nowrap">
                          {row.pill.label}
                        </StatusPill>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => addToLesson(row)}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Use in a lesson
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Tabs.Panel>
        );
      })}
    </Tabs.Root>
  );
}
