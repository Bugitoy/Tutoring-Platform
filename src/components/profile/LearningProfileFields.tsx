"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { FilterChip } from "@/components/shared/FilterChip";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { getCurriculum, type Level, type System } from "@/lib/curricula";
import {
  LEVEL_OPTIONS,
  cascadeProfile,
  curriculumOptions,
  gradeOptions,
  systemOptions,
  yearOptions,
  type LearningProfileErrors,
} from "@/lib/learningProfile";
import type { LearningProfile } from "@/lib/types";

type LearningProfileFieldsProps = {
  idPrefix: string;
  value: LearningProfile;
  onChange: (next: LearningProfile) => void;
  errors?: LearningProfileErrors;
  /** "Subjects I’m taking" or "Subjects Neo is taking" */
  subjectsLabel: string;
  goalsLabel: string;
};

type FieldProps = {
  id: string;
  label: string;
  value: string;
  display: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

function SelectField({ id, label, value, display, options, onChange }: FieldProps) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <span id={`${id}-label`} className="text-[13px] font-semibold text-foreground">
        {label}
      </span>
      <Select value={value} onValueChange={(next) => onChange(String(next))}>
        <SelectTrigger id={id} aria-labelledby={`${id}-label`} className="h-11 w-full rounded-[10px]">
          <span className="truncate">{display}</span>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function LearningProfileFields({
  idPrefix,
  value,
  onChange,
  errors = {},
  subjectsLabel,
  goalsLabel,
}: LearningProfileFieldsProps) {
  /** Goals saved before this edit show their subject as text; goals added now get a subject picker. */
  const [firstNewGoal, setFirstNewGoal] = useState(value.goals.length);
  if (value.goals.length < firstNewGoal) setFirstNewGoal(value.goals.length);
  const curriculum = getCurriculum(value.curriculumId);
  const subjects = curriculum?.subjects ?? [];
  const systems = systemOptions(value.level);
  const curricula = curriculumOptions(value.level, value.system);
  const years = yearOptions(value.curriculumId, value.year).map((year) => ({ value: year, label: year }));
  const grades = gradeOptions(value.curriculumId);
  const nameOf = (subjectId: string) => subjects.find((subject) => subject.id === subjectId)?.name ?? subjectId;
  const freeForGoal = value.subjectIds.filter((id) => !value.goals.some((goal) => goal.subjectId === id));

  function toggleSubject(subjectId: string, on: boolean) {
    onChange({
      ...value,
      subjectIds: on ? [...value.subjectIds, subjectId] : value.subjectIds.filter((id) => id !== subjectId),
      goals: on ? value.goals : value.goals.filter((goal) => goal.subjectId !== subjectId),
    });
  }

  function setGoal(index: number, next: Partial<LearningProfile["goals"][number]>) {
    onChange({ ...value, goals: value.goals.map((goal, i) => (i === index ? { ...goal, ...next } : goal)) });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SelectField
          id={`${idPrefix}-level`}
          label="Level"
          value={value.level}
          display={LEVEL_OPTIONS.find((option) => option.value === value.level)?.label ?? ""}
          options={LEVEL_OPTIONS}
          onChange={(level) => onChange(cascadeProfile(value, { level: level as Level }))}
        />
        <SelectField
          id={`${idPrefix}-system`}
          label="School system"
          value={value.system}
          display={systems.find((option) => option.value === value.system)?.label ?? ""}
          options={systems}
          onChange={(system) => onChange(cascadeProfile(value, { system: system as System }))}
        />
        <SelectField
          id={`${idPrefix}-curriculum`}
          label="Curriculum"
          value={value.curriculumId}
          display={curriculum?.name ?? ""}
          options={curricula}
          onChange={(curriculumId) => onChange(cascadeProfile(value, { curriculumId }))}
        />
        <SelectField
          id={`${idPrefix}-year`}
          label="Year"
          value={value.year}
          display={value.year}
          options={years}
          onChange={(year) => onChange(cascadeProfile(value, { year }))}
        />
      </div>

      <fieldset aria-describedby={errors.subjects ? `${idPrefix}-subjects-error` : undefined}>
        <legend id={`${idPrefix}-subjects`} tabIndex={-1} className="mb-2 text-[13px] font-semibold text-foreground outline-none">
          {subjectsLabel}
        </legend>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <FilterChip
              key={subject.id}
              pressed={value.subjectIds.includes(subject.id)}
              onPressedChange={(on) => toggleSubject(subject.id, on)}
            >
              {subject.name}
            </FilterChip>
          ))}
        </div>
        {errors.subjects ? (
          <p id={`${idPrefix}-subjects-error`} className="mt-2 text-xs text-destructive">
            {errors.subjects}
          </p>
        ) : null}
      </fieldset>

      <fieldset aria-describedby={errors.goals ? `${idPrefix}-goals-error` : undefined}>
        <legend id={`${idPrefix}-goals`} tabIndex={-1} className="mb-2 text-[13px] font-semibold text-foreground outline-none">
          {goalsLabel}
        </legend>
        <ul className="flex flex-col gap-2">
          {value.goals.map((goal, index) => {
            const choices = [goal.subjectId, ...freeForGoal].filter(Boolean);
            return (
              <li
                key={index}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface-subtle px-3 py-2.5"
              >
                {index < firstNewGoal ? (
                  <span className="text-sm font-semibold text-foreground">{nameOf(goal.subjectId)}</span>
                ) : (
                  <Select value={goal.subjectId} onValueChange={(next) => setGoal(index, { subjectId: String(next) })}>
                    <SelectTrigger aria-label={`Goal ${index + 1} subject`} className="h-9 min-w-44 rounded-lg bg-card">
                      <span className="truncate">{goal.subjectId ? nameOf(goal.subjectId) : "Choose a subject"}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {choices.map((id) => (
                        <SelectItem key={id} value={id}>
                          {nameOf(id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Target grade</span>
                  <Select value={goal.targetGrade} onValueChange={(next) => setGoal(index, { targetGrade: String(next) })}>
                    <SelectTrigger
                      aria-label={`Target grade for ${goal.subjectId ? nameOf(goal.subjectId) : `goal ${index + 1}`}`}
                      className="h-9 w-20 rounded-lg bg-card font-bold"
                    >
                      <span>{goal.targetGrade}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove the ${goal.subjectId ? nameOf(goal.subjectId) : ""} goal`}
                    onClick={() => {
                      if (index < firstNewGoal) setFirstNewGoal((count) => count - 1);
                      onChange({ ...value, goals: value.goals.filter((_, i) => i !== index) });
                    }}
                  >
                    <X aria-hidden="true" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
        {errors.goals ? (
          <p id={`${idPrefix}-goals-error`} className="mt-2 text-xs text-destructive">
            {errors.goals}
          </p>
        ) : null}
        {freeForGoal.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() =>
              onChange({
                ...value,
                goals: [...value.goals, { subjectId: freeForGoal[0], targetGrade: grades[2] ?? grades[0] }],
              })
            }
          >
            + Add a goal
          </Button>
        ) : null}
      </fieldset>
    </div>
  );
}
