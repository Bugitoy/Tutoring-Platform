"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import { cn } from "cn";
import { FilterChip } from "@/components/shared/FilterChip";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { TREE, getCurriculum, subjectsByCategory, type Curriculum, type Level, type System } from "@/lib/curricula";
import {
  curriculaFor,
  curriculumStatus,
  isEntire,
  isTicked,
  selectedSubjects,
  setEntire,
  setIbLevel,
  teachingListLabel,
  toggleCurriculum,
  toggleSubject,
  type TeachingState,
} from "@/lib/teaching";
import type { Tutor } from "@/lib/types";

export type TeachingView = { level: Level; system: System };

type Language = Tutor["languages"][number];

type TeachingPickerProps = {
  state: TeachingState;
  onChange: (next: TeachingState) => void;
  view: TeachingView;
  onViewChange: (next: TeachingView) => void;
  languages: Language[];
  onLanguagesChange: (next: Language[]) => void;
};

const LANGUAGES: Language[] = ["English", "Setswana"];

function StepLabel({ children }: { children: string }) {
  return <p className="mb-2 text-[11px] font-bold tracking-[0.07em] text-muted-foreground uppercase">{children}</p>;
}

/** `curriculum.note` holds research notes for the team, so tutors see the phase-in status instead. */
function statusNotice(curriculum: Curriculum): string | null {
  if (curriculum.status === "being-introduced") {
    return `${curriculum.name} is being phased in, replacing older syllabuses subject by subject.`;
  }
  if (curriculum.status === "being-phased-out") {
    return `${curriculum.name} is being phased out as new syllabuses replace it subject by subject.`;
  }
  return null;
}

function stageLine(curriculum: Curriculum) {
  if (curriculum.status === "being-introduced") return `New framework · ${curriculum.stage}`;
  if (curriculum.status === "being-phased-out") return `Being phased out · ${curriculum.stage}`;
  return curriculum.stage;
}

export function TeachingPicker({ state, onChange, view, onViewChange, languages, onLanguagesChange }: TeachingPickerProps) {
  const ids = curriculaFor(view.level, view.system);
  const curricula = ids.map((id) => getCurriculum(id)).filter((item): item is Curriculum => Boolean(item));
  const step = view.level === "secondary" ? 3 : 2;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <StepLabel>1 · Level</StepLabel>
        <div className="sm:w-64">
          <SegmentedControl
            label="Level"
            value={view.level}
            options={[
              { value: "primary", label: TREE.primary.label },
              { value: "secondary", label: TREE.secondary.label },
            ]}
            onChange={(level) => onViewChange({ ...view, level })}
          />
        </div>
      </div>

      {view.level === "secondary" ? (
        <div>
          <StepLabel>2 · School system</StepLabel>
          <div className="max-w-[26rem]">
            <SegmentedControl
              label="School system"
              value={view.system}
              options={[
                { value: "national", label: TREE.secondary.systems.national.label },
                { value: "international", label: TREE.secondary.systems.international.label },
              ]}
              onChange={(system) => onViewChange({ ...view, system })}
            />
          </div>
        </div>
      ) : null}

      <div>
        <StepLabel>{`${step} · Curricula you teach`}</StepLabel>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3">
          {curricula.map((curriculum) => {
            const ticked = isTicked(state, curriculum.id);
            return (
              <button
                key={curriculum.id}
                type="button"
                aria-pressed={ticked}
                onClick={() => onChange(toggleCurriculum(state, curriculum.id))}
                className={cn(
                  "flex flex-col items-start rounded-xl p-3.5 text-left transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  ticked ? "border-2 border-primary bg-accent" : "border border-input bg-card hover:bg-surface-subtle",
                )}
              >
                <span className="flex w-full items-start justify-between gap-2">
                  <span className="text-[15px] font-bold text-foreground">{curriculum.name}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-[5px]",
                      ticked ? "bg-primary text-primary-foreground" : "border border-input bg-card",
                    )}
                  >
                    {ticked ? <Check className="size-3.5" strokeWidth={3} /> : null}
                  </span>
                </span>
                <span className="mt-1 text-xs text-muted-foreground">{stageLine(curriculum)}</span>
                <span className={cn("mt-1.5 text-xs font-semibold", ticked ? "text-primary" : "text-muted-foreground")}>
                  {curriculumStatus(state, curriculum.id)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {curricula
        .filter((curriculum) => isTicked(state, curriculum.id))
        .map((curriculum) => (
          <SubjectPanel key={curriculum.id} curriculum={curriculum} state={state} onChange={onChange} />
        ))}

      <section aria-labelledby="teaching-list" className="rounded-xl border border-dashed border-input p-4">
        <h3 id="teaching-list" className="mb-2 text-[13px] font-semibold text-foreground">
          Your teaching list · across all levels
        </h3>
        {state.offerings.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">Nothing chosen yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {state.offerings.map((offering) => (
              <li
                key={`${offering.curriculumId}-${offering.subjectId ?? "entire"}`}
                className="rounded-[6px] bg-status-info-bg px-2 py-1 text-xs font-semibold text-status-info-fg"
              >
                {teachingListLabel(offering)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <fieldset>
        <legend className="mb-2 text-[13px] font-medium text-foreground">Languages you teach in</legend>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((language) => {
            const checked = languages.includes(language);
            return (
              <label
                key={language}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-4 text-sm",
                  checked ? "border-2 border-primary bg-accent font-semibold text-primary" : "border border-input bg-card text-foreground",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(next) =>
                    onLanguagesChange(
                      next === true
                        ? LANGUAGES.filter((item) => item === language || languages.includes(item))
                        : languages.filter((item) => item !== language),
                    )
                  }
                />
                {language}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

function SubjectPanel({
  curriculum,
  state,
  onChange,
}: {
  curriculum: Curriculum;
  state: TeachingState;
  onChange: (next: TeachingState) => void;
}) {
  const switchId = useId();
  const entire = isEntire(state, curriculum.id);
  const selected = selectedSubjects(state, curriculum.id);
  const groups = subjectsByCategory(curriculum.id).filter((group) => group.subjects.length > 0);
  const ibChoices =
    curriculum.id === "ib-dp" && !entire
      ? state.offerings.flatMap((offering) =>
          offering.curriculumId === "ib-dp" && offering.subjectId
            ? [{ subjectId: offering.subjectId, ibLevel: offering.ibLevel ?? "SL" }]
            : [],
        )
      : [];
  const notice = statusNotice(curriculum);

  return (
    <section aria-labelledby={`${switchId}-title`} className="rounded-xl bg-surface-subtle p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 id={`${switchId}-title`} className="text-[15px] font-bold text-foreground">
          {curriculum.name} subjects
        </h3>
        {curriculum.allowEntireCurriculum ? (
          <label
            htmlFor={switchId}
            className="flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-input bg-card px-3 text-[13px] text-foreground"
          >
            <Switch id={switchId} checked={entire} onCheckedChange={(on) => onChange(setEntire(state, curriculum.id, on))} />
            Entire curriculum
          </label>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        {groups.map((group) => (
          <div key={group.id}>
            {groups.length > 1 ? <p className="mb-1.5 text-xs font-medium text-muted-foreground">{group.name}</p> : null}
            <div className="flex flex-wrap gap-2">
              {group.subjects.map((subject) => (
                <FilterChip
                  key={subject.id}
                  pressed={selected.includes(subject.id)}
                  onPressedChange={() => onChange(toggleSubject(state, curriculum.id, subject.id))}
                >
                  {subject.name}
                </FilterChip>
              ))}
            </div>
          </div>
        ))}
      </div>

      {ibChoices.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2 border-t border-border pt-3">
          {ibChoices.map((offering) => {
            const name = curriculum.subjects.find((subject) => subject.id === offering.subjectId)?.name ?? offering.subjectId;
            return (
              <li key={offering.subjectId} className="flex items-center justify-between gap-3 text-[13px] text-foreground">
                {name}
                <span role="group" aria-label={`${name} level`} className="flex rounded-lg bg-divider-soft p-0.5">
                  {(["SL", "HL"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      aria-pressed={offering.ibLevel === level}
                      onClick={() => onChange(setIbLevel(state, offering.subjectId, level))}
                      className="h-8 min-w-11 rounded-md px-2 text-xs font-semibold text-muted-foreground aria-pressed:bg-card aria-pressed:text-primary"
                    >
                      {level}
                    </button>
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {notice ? <p className="mt-3 text-xs text-muted-foreground">{notice}</p> : null}
    </section>
  );
}
