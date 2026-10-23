"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shell/PageHeader";
import { resultsTrail } from "@/lib/matching";
import {
  activeFilterCount,
  clearedSearch,
  searchQuery,
  toTutorFilter,
  type TutorSearchState,
} from "@/lib/tutorSearch";
import type { Student, Tutor } from "@/lib/types";
import { CurriculumFilter } from "@/components/tutors/CurriculumFilter";
import { TutorCard } from "@/components/tutors/TutorCard";

type ChildOption = {
  key: "neo" | "lesego";
  student: Student;
};

type FindTutorsProps = {
  role: "student" | "parent";
  state: TutorSearchState;
  tutors: Tutor[];
  student: Student | null;
  childOptions: ChildOption[];
  matchedProfile: boolean;
  subtitle: string;
};

export function FindTutors({
  role,
  state,
  tutors,
  student,
  childOptions,
  matchedProfile,
  subtitle,
}: FindTutorsProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filter = toTutorFilter(state);
  const countLabel = tutors.length === 1 ? "1 tutor" : `${tutors.length} tutors`;

  function push(next: TutorSearchState) {
    const query = searchQuery(next, role);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function renderFilters() {
    return (
      <CurriculumFilter
        role={role}
        state={state}
        student={student}
        childOptions={childOptions}
        matchedProfile={matchedProfile}
        onChange={push}
      />
    );
  }

  return (
    <>
      <PageHeader title="Find a tutor" subtitle={subtitle} />
      <div className="lg:grid lg:grid-cols-[minmax(320px,1fr)_minmax(0,3fr)] lg:items-start lg:gap-6">
        <div className="hidden lg:block">{renderFilters()}</div>
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
              Filters ({activeFilterCount(state)})
            </Button>
            <p className="min-w-0 flex-1 text-sm">
              <span className="font-semibold text-foreground">{countLabel}</span>
              <span className="text-muted-foreground"> · {resultsTrail(filter)}</span>
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => push(clearedSearch())}>
              Clear filters
            </Button>
          </div>
          {tutors.length === 0 ? (
            <EmptyState
              title="No tutors match yet"
              description="Try “Any subject”, or ask the community while we find one."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {tutors.map((tutor) => (
                <TutorCard
                  key={tutor.id}
                  tutor={tutor}
                  filter={filter}
                  bookHref={bookHref(role, tutor.id, state)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto bg-card">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">{renderFilters()}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function bookHref(role: "student" | "parent", tutorId: string, state: TutorSearchState) {
  const base = role === "student" ? "/student/tutors" : "/parent/tutors";
  return `${base}/${tutorId}/book?${searchQuery(state, role)}`;
}
