"use client";

import { useId, useOptimistic, useState, useTransition } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusPill } from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { toggleSavedOffline } from "@/lib/actions/library";
import type { LibraryItem } from "@/lib/types";

export type LibraryRow = Pick<LibraryItem, "id" | "title" | "meta" | "kind" | "sizeMb" | "savedOffline" | "tab" | "subjectId">;

type LibraryWorkspaceProps = {
  rows: LibraryRow[];
  subjects: { id: string; name: string }[];
  defaultSubjectId: string;
};

type TabId = LibraryItem["tab"];

const ALL = "all";

const TABS: { id: TabId; label: string; empty: string }[] = [
  { id: "notes", label: "My lesson notes", empty: "Notes and whiteboards from your lessons collect here after each lesson." },
  { id: "past-papers", label: "Past papers", empty: "No past papers for this subject yet." },
  { id: "from-tutors", label: "From tutors", empty: "Files your tutors share in Messages appear here." },
];

function formatMb(mb: number) {
  return `${Number.isInteger(mb) ? mb : mb.toFixed(1)} MB`;
}

export function LibraryWorkspace({ rows, subjects, defaultSubjectId }: LibraryWorkspaceProps) {
  const id = useId();
  const [tab, setTab] = useState<TabId>("past-papers");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState(defaultSubjectId);
  const [, startTransition] = useTransition();
  const [items, setSaved] = useOptimistic(rows, (current, change: { id: string; saved: boolean }) =>
    current.map((row) => (row.id === change.id ? { ...row, savedOffline: change.saved } : row)),
  );

  const saved = items.filter((row) => row.savedOffline);
  const savedMb = saved.reduce((sum, row) => sum + row.sizeMb, 0);
  const needle = query.trim().toLowerCase();
  const subjectName = subjects.find((item) => item.id === subject)?.name;

  function toggle(row: LibraryRow) {
    const next = !row.savedOffline;
    startTransition(async () => {
      setSaved({ id: row.id, saved: next });
      const result = await toggleSavedOffline(row.id, next);
      if (!result.ok) toast.error(result.error);
      else toast.success(next ? `“${row.title}” saved for offline` : `“${row.title}” removed from this device`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <StatusPill tone="success" className="self-start">
        {saved.length} {saved.length === 1 ? "file" : "files"} saved for offline · {formatMb(savedMb)} · open them without using data
      </StatusPill>

      <Tabs.Root value={tab} onValueChange={(value) => setTab(value as TabId)} className="flex flex-col gap-4">
        <Tabs.List
          aria-label="Library sections"
          className="grid w-full grid-cols-3 gap-1 rounded-xl border border-border bg-card p-1"
        >
          {TABS.map((item) => (
            <Tabs.Tab
              key={item.id}
              value={item.id}
              className="h-10 rounded-lg px-2 text-[13px] font-medium text-text-secondary transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none data-active:bg-primary data-active:font-semibold data-active:text-primary-foreground sm:text-sm"
            >
              {item.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor={`${id}-search`} className="text-[13px] font-semibold text-foreground">
              Search
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id={`${id}-search`}
                type="search"
                placeholder="e.g. quadratics, 2023 Paper 2"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 rounded-[10px] bg-card pl-9"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 sm:w-56">
            <span id={`${id}-subject`} className="text-[13px] font-semibold text-foreground">
              Subject
            </span>
            <Select value={subject} onValueChange={(value) => setSubject(String(value))}>
              <SelectTrigger aria-labelledby={`${id}-subject`} className="h-11 w-full rounded-[10px] bg-card">
                <span className="truncate">{subject === ALL ? "All my subjects" : subjectName}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All my subjects</SelectItem>
                {subjects.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {TABS.map((item) => {
          const inTab = items.filter((row) => row.tab === item.id);
          const shown = inTab.filter(
            (row) =>
              (subject === ALL || row.subjectId === subject) &&
              (!needle || `${row.title} ${row.meta}`.toLowerCase().includes(needle)),
          );
          const filtered = shown.length === 0 && inTab.length > 0;
          return (
            <Tabs.Panel key={item.id} value={item.id} className="outline-none">
              {shown.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-5">
                  <EmptyState
                    title={filtered ? "Nothing matches" : "Nothing here yet"}
                    description={filtered ? "Try another search or subject." : item.empty}
                  />
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {shown.map((row) => (
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
                      <div className="ml-auto flex shrink-0 items-center gap-3">
                        <span className="text-xs text-muted-foreground">{formatMb(row.sizeMb)}</span>
                        {row.savedOffline ? (
                          <Button
                            type="button"
                            size="sm"
                            aria-pressed="true"
                            aria-label={`${row.title} is saved offline. Remove from this device`}
                            onClick={() => toggle(row)}
                            className="bg-status-success-bg text-status-success-fg hover:bg-status-success-bg/80"
                          >
                            Saved offline
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            aria-label={`Download ${row.title}`}
                            onClick={() => toggle(row)}
                            className="border-primary text-primary hover:bg-accent hover:text-primary"
                          >
                            Download
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Tabs.Panel>
          );
        })}
      </Tabs.Root>
    </div>
  );
}
