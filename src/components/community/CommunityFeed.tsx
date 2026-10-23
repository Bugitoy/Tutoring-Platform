"use client";

import { useState } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterChip } from "@/components/shared/FilterChip";
import { Input } from "@/components/ui/input";
import { QuestionCard, type FeedQuestion } from "./QuestionCard";

export type SubjectChip = { id: string; label: string; curriculumId?: string; subjectId: string };

type CommunityFeedProps = {
  questions: FeedQuestion[];
  /** The student's subjects; the first starts switched on. */
  subjectChips: SubjectChip[];
};

type TabId = "for-you" | "unanswered" | "mine";

function matchesChip(question: FeedQuestion, chip: SubjectChip) {
  return question.subjectId === chip.subjectId && (!chip.curriculumId || question.curriculumId === chip.curriculumId);
}

export function CommunityFeed({ questions, subjectChips }: CommunityFeedProps) {
  const [tab, setTab] = useState<TabId>("for-you");
  const [query, setQuery] = useState("");
  const [subjectsOn, setSubjectsOn] = useState<string[]>(subjectChips.slice(0, 1).map((chip) => chip.id));
  const [pastPapers, setPastPapers] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const unanswered = questions.filter((question) => question.status === "unanswered");
  const tabs: { id: TabId; label: string; rows: FeedQuestion[]; empty: string }[] = [
    { id: "for-you", label: "For you", rows: questions, empty: "Ask the first question for your subjects." },
    { id: "unanswered", label: `Unanswered · ${unanswered.length}`, rows: unanswered, empty: "Every question has an answer. Nice work, everyone." },
    { id: "mine", label: "My questions", rows: questions.filter((question) => question.isMine), empty: "Questions you ask appear here." },
  ];

  const activeChips = subjectChips.filter((chip) => subjectsOn.includes(chip.id));
  const needle = query.trim().toLowerCase();
  const filtersOn = activeChips.length > 0 || pastPapers || verifiedOnly || Boolean(needle);

  function visible(rows: FeedQuestion[]) {
    return rows.filter(
      (question) =>
        (activeChips.length === 0 || activeChips.some((chip) => matchesChip(question, chip))) &&
        (!pastPapers || question.isPastPaper) &&
        (!verifiedOnly || question.status === "verified") &&
        (!needle || `${question.title} ${question.topic ?? ""} ${question.course}`.toLowerCase().includes(needle)),
    );
  }

  function clearFilters() {
    setSubjectsOn([]);
    setPastPapers(false);
    setVerifiedOnly(false);
    setQuery("");
  }

  return (
    <Tabs.Root value={tab} onValueChange={(value) => setTab(value as TabId)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <Tabs.List
          aria-label="Questions"
          className="flex shrink-0 gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1"
        >
          {tabs.map((item) => (
            <Tabs.Tab
              key={item.id}
              value={item.id}
              className="h-9 flex-1 rounded-lg px-3 text-[13px] font-medium whitespace-nowrap text-text-secondary transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none data-active:bg-primary data-active:font-semibold data-active:text-primary-foreground md:flex-none"
            >
              {item.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Search questions"
            placeholder="Search questions"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 rounded-[10px] bg-card pl-9"
          />
        </div>
      </div>

      <div role="group" aria-label="Filter questions" className="flex flex-wrap gap-2">
        {subjectChips.map((chip) => (
          <FilterChip
            key={chip.id}
            pressed={subjectsOn.includes(chip.id)}
            onPressedChange={(on) =>
              setSubjectsOn((current) => (on ? [...current, chip.id] : current.filter((idOn) => idOn !== chip.id)))
            }
          >
            {chip.label}
          </FilterChip>
        ))}
        <FilterChip pressed={pastPapers} onPressedChange={setPastPapers}>
          Past papers
        </FilterChip>
        <FilterChip pressed={verifiedOnly} onPressedChange={setVerifiedOnly}>
          Verified only
        </FilterChip>
      </div>

      {tabs.map((item) => {
        const rows = visible(item.rows);
        const filtered = rows.length === 0 && item.rows.length > 0 && filtersOn;
        return (
          <Tabs.Panel key={item.id} value={item.id} className="outline-none">
            {rows.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <EmptyState
                  title={filtered ? "No questions match" : "Nothing here yet"}
                  description={filtered ? "Try fewer filters or another search." : item.empty}
                  action={
                    filtered ? (
                      <button type="button" onClick={clearFilters} className="text-sm font-semibold text-primary underline">
                        Clear filters
                      </button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {rows.map((question) => (
                  <li key={question.id}>
                    <QuestionCard question={question} />
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
