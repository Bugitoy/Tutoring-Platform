"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { FilterChip } from "@/components/shared/FilterChip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { getCurriculum } from "@/lib/curricula";
import {
  curriculaForCascade,
  subjectGroups,
  systemOptionLabel,
  withCurriculum,
  withLevel,
  withSubject,
  withSystem,
} from "@/lib/matching";
import type { ChildKey, TutorSearchState } from "@/lib/tutorSearch";
import { defaultExtras, profileCascade } from "@/lib/tutorSearch";
import type { LearningProfile, Student } from "@/lib/types";

type ChildOption = {
  key: Exclude<ChildKey, "other">;
  student: Student;
};

type CurriculumFilterProps = {
  role: "student" | "parent";
  state: TutorSearchState;
  student: Student | null;
  childOptions: ChildOption[];
  matchedProfile: boolean;
  onChange: (next: TutorSearchState) => void;
};

function yearLine(profile: LearningProfile) {
  const curriculum = getCurriculum(profile.curriculumId);
  const year = profile.year.replace(/^Standard /, "Std ");
  return `${year} · ${curriculum?.name ?? ""}`;
}

function FieldLabel({ children }: { children: string }) {
  return (
    <p className="mb-2 text-xs font-bold tracking-[0.07em] text-muted-foreground uppercase">{children}</p>
  );
}

export function CurriculumFilter({
  role,
  state,
  student,
  childOptions,
  matchedProfile,
  onChange,
}: CurriculumFilterProps) {
  const curricula = curriculaForCascade(state.level, state.system);
  const groups = subjectGroups(state.curriculumId);

  function patch(next: Partial<TutorSearchState>, markCustom = true) {
    onChange({
      ...state,
      ...next,
      child: role === "parent" && markCustom ? "other" : state.child,
    });
  }

  function selectChild(key: Exclude<ChildKey, "other">) {
    const child = childOptions.find((item) => item.key === key);
    if (!child) return;
    onChange({
      ...profileCascade(child.student.learningProfile),
      ...defaultExtras(),
      child: key,
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {role === "parent" ? (
        <div className="mb-5">
          <FieldLabel>Searching for</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {childOptions.map((child) => {
              const selected = state.child === child.key;
              return (
                <button
                  key={child.key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectChild(child.key)}
                  className={
                    selected
                      ? "rounded-xl border-2 border-primary bg-accent px-3 py-2.5 text-left"
                      : "rounded-xl border border-input bg-card px-3 py-2.5 text-left"
                  }
                >
                  <span className="block text-sm font-semibold text-foreground">{child.student.firstName}</span>
                  <span className="block text-xs text-muted-foreground">{yearLine(child.student.learningProfile)}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-pressed={state.child === "other"}
            onClick={() => onChange({ ...state, child: "other" })}
            className={
              state.child === "other"
                ? "mt-2 w-full rounded-xl border-2 border-primary bg-accent px-3 py-2.5 text-left"
                : "mt-2 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-left"
            }
          >
            <span className="block text-sm font-semibold text-foreground">Someone else</span>
            <span className="block text-xs text-muted-foreground">Set filters yourself</span>
          </button>
          <p className="mt-2 text-xs text-muted-foreground">Filters start from your child’s learning profile.</p>
        </div>
      ) : null}

      {role === "student" && student ? (
        <div className="mb-5 rounded-xl bg-accent px-4 py-3">
          {matchedProfile ? (
            <>
              <p className="text-sm font-semibold text-primary">Matched to your learning profile</p>
              <p className="mt-0.5 text-sm text-foreground">{yearLine(student.learningProfile)} · {subjectLine(state)}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-primary">Custom search</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={() =>
                  onChange({
                    ...profileCascade(student.learningProfile),
                    ...defaultExtras(),
                    child: "other",
                  })
                }
              >
                Back to my profile
              </Button>
            </>
          )}
          <Link href="/student/profile" className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline">
            Edit learning profile
          </Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>Level</FieldLabel>
          <SegmentedControl
            label="Level"
            value={state.level}
            options={[
              { value: "any", label: "Any" },
              { value: "primary", label: "Primary" },
              { value: "secondary", label: "Secondary" },
            ]}
            onChange={(level) => {
              const next = withLevel(state, level);
              patch(next);
            }}
          />
        </div>

        <div>
          <FieldLabel>School system</FieldLabel>
          <SegmentedControl
            label="School system"
            value={state.system}
            options={[
              { value: "any", label: "Any" },
              { value: "national", label: systemOptionLabel(state.level, "national") },
              { value: "international", label: systemOptionLabel(state.level, "international") },
            ]}
            onChange={(system) => patch(withSystem(state, system))}
          />
        </div>

        <div>
          <FieldLabel>Curriculum</FieldLabel>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              pressed={state.curriculumId === "any"}
              onPressedChange={() => patch(withCurriculum(state, "any"))}
            >
              Any
            </FilterChip>
            {curricula.map((curriculum) => (
              <FilterChip
                key={curriculum.id}
                pressed={state.curriculumId === curriculum.id}
                onPressedChange={() => patch(withCurriculum(state, curriculum.id))}
              >
                {curriculum.name}
              </FilterChip>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Subject</FieldLabel>
          {state.curriculumId === "any" ? (
            <p className="text-sm text-muted-foreground">Choose a curriculum to pick a subject.</p>
          ) : (
            <ScrollArea className="h-[260px] rounded-xl border border-border">
              <div className="p-3">
                <FilterChip
                  pressed={state.subjectId === "any"}
                  onPressedChange={() => patch(withSubject(state, "any"))}
                >
                  Any subject
                </FilterChip>
                {groups.map((group) => (
                  <div key={group.id} className="mt-3">
                    <p className="mb-2 text-xs font-semibold text-text-secondary">{group.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.subjects.map((subject) => (
                        <FilterChip
                          key={subject.id}
                          pressed={state.subjectId === subject.id}
                          onPressedChange={() => patch(withSubject(state, subject.id))}
                        >
                          {subject.name}
                        </FilterChip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-foreground">
            Available
            <Select
              value={state.availability}
              onValueChange={(value) =>
                patch({ availability: value === "today" || value === "week" ? value : "any" })
              }
            >
              <SelectTrigger className="mt-1.5 h-11 w-full rounded-[10px]">
                <span className="truncate">
                  {state.availability === "today" ? "Today" : state.availability === "week" ? "This week" : "Any time"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="text-sm font-medium text-foreground">
            Price per hour
            <Select
              value={state.priceBand}
              onValueChange={(value) =>
                patch({
                  priceBand:
                    value === "under-100" || value === "100-150" || value === "over-150" ? value : "any",
                })
              }
            >
              <SelectTrigger className="mt-1.5 h-11 w-full rounded-[10px]">
                <span className="truncate">
                  {state.priceBand === "under-100"
                    ? "Under P100"
                    : state.priceBand === "100-150"
                      ? "P100–P150"
                      : state.priceBand === "over-150"
                        ? "Over P150"
                        : "Any price"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any price</SelectItem>
                <SelectItem value="under-100">Under P100</SelectItem>
                <SelectItem value="100-150">P100–P150</SelectItem>
                <SelectItem value="over-150">Over P150</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <CheckRow
            checked={state.verifiedOnly}
            onChange={(verifiedOnly) => patch({ verifiedOnly })}
            label="Verified tutors only"
          />
          <CheckRow
            checked={state.teachesSetswana}
            onChange={(teachesSetswana) => patch({ teachesSetswana })}
            label="Teaches in Setswana"
          />
          <CheckRow
            checked={state.freeTrial}
            onChange={(freeTrial) => patch({ freeTrial })}
            label="Offers a free trial lesson"
          />
        </div>
      </div>
    </div>
  );
}

function subjectLine(state: TutorSearchState) {
  if (state.subjectId === "any") return "Any subject";
  const curriculum = getCurriculum(state.curriculumId);
  return curriculum?.subjects.find((subject) => subject.id === state.subjectId)?.name ?? "Any subject";
}

function CheckRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-foreground">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        className="size-5"
      />
      {label}
    </label>
  );
}

