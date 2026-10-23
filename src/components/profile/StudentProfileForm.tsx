"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/shared/Avatar";
import { TileRadioGroup } from "@/components/shared/TileRadioGroup";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { saveStudentProfile } from "@/lib/actions/profile";
import { validateLearningProfile, type LearningProfileErrors } from "@/lib/learningProfile";
import type { LearningProfile, StudentPreferences, StudentProfileInput, VideoQuality } from "@/lib/types";
import { AccountSecurityCard } from "./AccountSecurityCard";
import { LearningProfileFields } from "./LearningProfileFields";
import { ProfileHeader } from "./ProfileHeader";

export type LinkedParentView = {
  name: string;
  firstName: string;
  initials: string;
  /** "Mother · linked since Feb" */
  meta: string;
  can: string[];
  note?: string;
};

type StudentProfileFormProps = {
  initials: string;
  /** "Form 4 · BGCSE · Gaborone" */
  summary: string;
  initial: StudentProfileInput;
  parent?: LinkedParentView;
  /** "Visa debit •••• 7310" */
  cardLabel?: string;
  plusIncluded: boolean;
};

type Errors = LearningProfileErrors & { fullName?: string; email?: string };

const LANGUAGES: LearningProfile["preferredLanguage"][] = ["English", "Setswana", "Either"];

const VIDEO: { value: VideoQuality; label: string }[] = [
  { value: "hd", label: "HD" },
  { value: "auto", label: "Auto" },
  { value: "data_saver", label: "Data saver" },
];

const PREFERENCE_CHECKS: { key: Exclude<keyof StudentPreferences, "videoQuality">; label: string }[] = [
  { key: "remindBeforeLesson", label: "Remind me 30 minutes before each lesson" },
  { key: "homeworkReminders", label: "Tell me when homework is due" },
  { key: "showOnLeaderboard", label: "Show my name on the community leaderboard" },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function StudentProfileForm({ initials, summary, initial, parent, cardLabel, plusIncluded }: StudentProfileFormProps) {
  const id = useId();
  const formId = `${id}-form`;
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  function patchProfile(next: Partial<LearningProfile>) {
    setDraft((current) => ({ ...current, learningProfile: { ...current.learningProfile, ...next } }));
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const found: Errors = { ...validateLearningProfile(draft.learningProfile) };
    if (!draft.fullName.trim()) found.fullName = "Enter your full name.";
    if (!EMAIL.test(draft.email.trim())) found.email = "Enter an email address like name@example.com.";
    setErrors(found);
    const first = (["fullName", "email", "subjects", "goals"] as const).find((key) => found[key]);
    if (first) {
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    startTransition(async () => {
      const result = await saveStudentProfile(draft);
      if (result.ok) {
        setSaved(draft);
        toast.success("Profile saved. Find tutors and your Library now use these choices.");
      } else toast.error(result.error);
    });
  }

  const saveButton = (
    <Button type="submit" form={formId} size="lg" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );

  return (
    <>
      <ProfileHeader
        initials={initials}
        name={saved.fullName}
        line={`Student · ${summary}`}
        actions={<div className="hidden lg:block">{saveButton}</div>}
      />

      <div className="grid items-start gap-6 pb-20 lg:pb-0 xl:grid-cols-[minmax(0,1fr)_340px]">
        <form id={formId} onSubmit={submit} noValidate className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby={`${id}-personal`} className="rounded-xl border border-border bg-card p-5 md:p-6">
            <h2 id={`${id}-personal`} className="mb-4 text-[17px] font-bold text-foreground">
              Personal details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor={`${id}-fullName`}>Full name</Label>
                <Input
                  id={`${id}-fullName`}
                  value={draft.fullName}
                  autoComplete="name"
                  onChange={(event) => setDraft({ ...draft, fullName: event.target.value })}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? `${id}-fullName-error` : undefined}
                  className="h-11 rounded-[10px]"
                />
                {errors.fullName ? (
                  <p id={`${id}-fullName-error`} className="text-xs text-destructive">
                    {errors.fullName}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`${id}-email`}>Email</Label>
                <Input
                  id={`${id}-email`}
                  type="email"
                  autoComplete="email"
                  value={draft.email}
                  onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? `${id}-email-error` : undefined}
                  className="h-11 rounded-[10px]"
                />
                {errors.email ? (
                  <p id={`${id}-email-error`} className="text-xs text-destructive">
                    {errors.email}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`${id}-school`}>School</Label>
                <Input
                  id={`${id}-school`}
                  value={draft.learningProfile.school ?? ""}
                  onChange={(event) => patchProfile({ school: event.target.value })}
                  className="h-11 rounded-[10px]"
                />
              </div>
              <div className="grid gap-1.5">
                <span id={`${id}-language`} className="text-sm leading-none font-medium text-foreground">
                  Preferred lesson language
                </span>
                <Select
                  value={draft.learningProfile.preferredLanguage}
                  onValueChange={(value) => patchProfile({ preferredLanguage: value as LearningProfile["preferredLanguage"] })}
                >
                  <SelectTrigger aria-labelledby={`${id}-language`} className="h-11 w-full rounded-[10px]">
                    <span>{draft.learningProfile.preferredLanguage}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section aria-labelledby={`${id}-learning`} className="rounded-xl border border-border bg-card p-5 md:p-6">
            <h2 id={`${id}-learning`} className="text-[17px] font-bold text-foreground">
              Learning profile
            </h2>
            <p className="mt-1 mb-4 text-[13px] text-muted-foreground">
              Used to match you with tutors and to filter past papers in your Library.
            </p>
            <LearningProfileFields
              idPrefix={id}
              value={draft.learningProfile}
              onChange={(learningProfile) => setDraft({ ...draft, learningProfile })}
              errors={errors}
              subjectsLabel="Subjects I’m taking"
              goalsLabel="My goals"
            />
          </section>

          <section aria-labelledby={`${id}-prefs`} className="rounded-xl border border-border bg-card p-5 md:p-6">
            <h2 id={`${id}-prefs`} className="mb-4 text-[17px] font-bold text-foreground">
              Lesson preferences
            </h2>
            <p className="mb-2 text-[13px] font-semibold text-foreground">Default video quality</p>
            <TileRadioGroup
              label="Default video quality"
              size="compact"
              value={draft.preferences.videoQuality}
              options={VIDEO}
              onChange={(videoQuality) => setDraft({ ...draft, preferences: { ...draft.preferences, videoQuality } })}
            />
            <div className="mt-4 flex flex-col gap-3">
              {PREFERENCE_CHECKS.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 text-sm text-foreground">
                  <Checkbox
                    checked={draft.preferences[key]}
                    onCheckedChange={(checked) =>
                      setDraft({ ...draft, preferences: { ...draft.preferences, [key]: checked === true } })
                    }
                    className="size-5"
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>

          <AccountSecurityCard headingId={`${id}-account`} variant="student" />
        </form>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-8">
          {parent ? (
            <section className="rounded-xl border-2 border-primary bg-card p-5">
              <h2 className="mb-3 text-[15px] font-bold text-foreground">Linked parent</h2>
              <div className="mb-3 flex items-center gap-3">
                <Avatar initials={parent.initials} size={44} />
                <div>
                  <p className="text-[15px] font-bold text-foreground">{parent.name}</p>
                  <p className="text-xs text-muted-foreground">{parent.meta}</p>
                </div>
              </div>
              <p className="mb-2 text-[13px] font-semibold text-foreground">{parent.firstName} can</p>
              <ul className="flex flex-col gap-1.5">
                {parent.can.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-text-secondary">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-status-success-fg" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              {parent.note ? <p className="mt-3 text-xs text-muted-foreground">{parent.note}</p> : null}
            </section>
          ) : null}

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-2 text-[15px] font-bold text-foreground">Payment</h2>
            <p className="text-sm text-text-secondary">{cardLabel ?? "No card saved yet"}</p>
            <Link href="/student/payments" className="mt-2 inline-flex text-sm font-semibold text-primary underline underline-offset-2">
              Manage cards and payments
            </Link>
          </section>

          {plusIncluded ? (
            <section className="rounded-xl bg-accent p-5">
              <h2 className="mb-1 text-[15px] font-bold text-foreground">Thanodi Plus</h2>
              <p className="text-[13px] text-text-secondary">
                Included through your parent’s plan: past papers, saved lesson notes and the study helper.
              </p>
            </section>
          ) : null}
        </aside>
      </div>

      {dirty ? (
        <div
          role="status"
          className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3 sm:bottom-0 lg:hidden"
        >
          <p className="text-sm font-semibold text-foreground">You have unsaved changes</p>
          {saveButton}
        </div>
      ) : null}
    </>
  );
}
