"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Avatar } from "@/components/shared/Avatar";
import { StatusPill, type StatusTone } from "@/components/shared/StatusPill";
import { PageHeader } from "@/components/shell/PageHeader";
import { TeachingPicker, type TeachingView } from "@/components/tutor/TeachingPicker";
import { TutorCard } from "@/components/tutors/TutorCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PLACEHOLDERS } from "@/config/placeholders";
import { saveTutorProfile } from "@/lib/actions/tutor";
import { initialView, previewTags, teachingFromOfferings, type TeachingState } from "@/lib/teaching";
import type { Tutor, TutorProfileInput, VerifyState } from "@/lib/types";

type Prices = { min60: string; min45: string; min30: string };

type Draft = {
  headline: string;
  bio: string;
  teaching: TeachingState;
  languages: Tutor["languages"];
  prices: Prices;
  freeTrial: boolean;
};

type Errors = Partial<Record<"headline" | "teaching" | "languages" | "prices", string>>;

const PRICE_FIELDS: { key: keyof Prices; label: string }[] = [
  { key: "min60", label: "60 minutes" },
  { key: "min45", label: "45 minutes" },
  { key: "min30", label: "30 minutes" },
];

const VERIFY_PILL: Record<VerifyState, { label: string; tone: StatusTone }> = {
  verified: { label: "Verified", tone: "success" },
  in_review: { label: "In review", tone: "warning" },
  not_started: { label: "Not started", tone: "neutral" },
};

function draftFrom(tutor: Tutor): Draft {
  return {
    headline: tutor.headline,
    bio: tutor.bio,
    teaching: teachingFromOfferings(tutor.offerings),
    languages: tutor.languages,
    prices: {
      min60: String(tutor.prices.min60 / 100),
      min45: String(tutor.prices.min45 / 100),
      min30: String(tutor.prices.min30 / 100),
    },
    freeTrial: tutor.freeTrial,
  };
}

function toThebe(value: string) {
  return Math.round(Number(value) * 100);
}

function snapshot(draft: Draft) {
  return JSON.stringify({ ...draft, teaching: draft.teaching.offerings });
}

export function TutorProfileForm({ tutor }: { tutor: Tutor }) {
  const id = useId();
  const formId = `${id}-form`;
  const [saved, setSaved] = useState(() => draftFrom(tutor));
  const [draft, setDraft] = useState(saved);
  const [view, setView] = useState<TeachingView>(() => initialView(tutor.offerings));
  const [photo, setPhoto] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();
  const photoInput = useRef<HTMLInputElement>(null);
  const dirty = snapshot(draft) !== snapshot(saved);

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo);
  }, [photo]);

  function patch(next: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function validate(): Errors {
    const found: Errors = {};
    if (!draft.headline.trim()) found.headline = "Add a headline so parents know what you teach.";
    if (draft.teaching.offerings.length === 0) found.teaching = "Choose at least one subject or a whole curriculum.";
    if (draft.languages.length === 0) found.languages = "Choose at least one language you teach in.";
    if (PRICE_FIELDS.some(({ key }) => !(Number(draft.prices[key]) > 0))) found.prices = "Enter a price above P0 for every lesson length.";
    return found;
  }

  function submit(event?: React.FormEvent) {
    event?.preventDefault();
    const found = validate();
    setErrors(found);
    const first = (["headline", "teaching", "languages", "prices"] as const).find((key) => found[key]);
    if (first) {
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }

    const input: TutorProfileInput = {
      headline: draft.headline,
      bio: draft.bio,
      offerings: draft.teaching.offerings,
      languages: draft.languages,
      prices: { min60: toThebe(draft.prices.min60), min45: toThebe(draft.prices.min45), min30: toThebe(draft.prices.min30) },
      freeTrial: draft.freeTrial,
    };
    startTransition(async () => {
      const result = await saveTutorProfile(input);
      if (result.ok) {
        setSaved(draft);
        toast.success("Profile saved. Parents see the changes straight away.");
      } else toast.error(result.error);
    });
  }

  const preview: Tutor = {
    ...tutor,
    headline: draft.headline.trim() || "Your headline",
    bio: draft.bio.trim() || "Tell parents how you teach.",
    offerings: draft.teaching.offerings,
    languages: draft.languages,
    prices: { ...tutor.prices, min60: Number(draft.prices.min60) > 0 ? toThebe(draft.prices.min60) : tutor.prices.min60 },
    freeTrial: draft.freeTrial,
  };

  const saveButton = (
    <Button type="submit" form={formId} size="lg" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Profile & pricing"
        subtitle="This is what parents see when they search for a tutor."
        actions={<div className="hidden lg:block">{saveButton}</div>}
      />

      <div className="grid items-start gap-6 pb-20 lg:pb-0 xl:grid-cols-[minmax(0,1fr)_340px]">
        <form id={formId} onSubmit={submit} noValidate className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby={`${id}-about`} className="rounded-xl border border-border bg-card p-5 md:p-6">
            <h2 id={`${id}-about`} className="mb-4 text-[17px] font-bold text-foreground">
              About you
            </h2>
            <div className="mb-4 flex items-center gap-4">
              {photo ? (
                <Image src={photo} alt="Your new photo" width={72} height={72} unoptimized className="size-18 rounded-full object-cover" />
              ) : (
                <Avatar initials={tutor.initials} size={72} />
              )}
              <input
                ref={photoInput}
                type="file"
                accept="image/*"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) setPhoto(URL.createObjectURL(file));
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => photoInput.current?.click()}>
                Change photo
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor={`${id}-headline`}>Headline</Label>
                <Input
                  id={`${id}-headline`}
                  value={draft.headline}
                  maxLength={60}
                  onChange={(event) => patch({ headline: event.target.value })}
                  placeholder="e.g. Maths teacher · 6 years"
                  aria-invalid={Boolean(errors.headline)}
                  aria-describedby={errors.headline ? `${id}-headline-error` : undefined}
                  className="h-11 rounded-[10px]"
                />
                {errors.headline ? (
                  <p id={`${id}-headline-error`} className="text-xs text-destructive">
                    {errors.headline}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`${id}-bio`}>About your teaching</Label>
                <Textarea
                  id={`${id}-bio`}
                  value={draft.bio}
                  maxLength={400}
                  onChange={(event) => patch({ bio: event.target.value })}
                  className="min-h-20 rounded-[10px]"
                />
              </div>
            </div>
          </section>

          <section aria-labelledby={`${id}-teach`} className="rounded-xl border border-border bg-card p-5 md:p-6">
            <h2 id={`${id}-teach`} className="text-[17px] font-bold text-foreground">
              What you teach
            </h2>
            <p className="mt-1 mb-4 text-[13px] text-muted-foreground">
              Choose a level, then the curricula you teach, then whole curricula or single subjects. Parents and students
              search by exactly these choices.
            </p>
            <TeachingPicker
              state={draft.teaching}
              onChange={(teaching) => patch({ teaching })}
              view={view}
              onViewChange={setView}
              languages={draft.languages}
              onLanguagesChange={(languages) => patch({ languages })}
            />
            {errors.teaching || errors.languages ? (
              <div className="mt-3 flex flex-col gap-1">
                {errors.teaching ? (
                  <p id={`${id}-teaching`} tabIndex={-1} className="text-xs text-destructive outline-none">
                    {errors.teaching}
                  </p>
                ) : null}
                {errors.languages ? (
                  <p id={`${id}-languages`} tabIndex={-1} className="text-xs text-destructive outline-none">
                    {errors.languages}
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>

          <section aria-labelledby={`${id}-pricing`} className="rounded-xl border border-border bg-card p-5 md:p-6">
            <h2 id={`${id}-pricing`} className="mb-4 text-[17px] font-bold text-foreground">
              Pricing
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {PRICE_FIELDS.map(({ key, label }, index) => (
                <div key={key} className="grid gap-1.5">
                  <Label htmlFor={index === 0 ? `${id}-prices` : `${id}-${key}`}>{label}</Label>
                  <div className="relative">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-muted-foreground"
                    >
                      P
                    </span>
                    <Input
                      id={index === 0 ? `${id}-prices` : `${id}-${key}`}
                      type="number"
                      inputMode="decimal"
                      min={1}
                      step={5}
                      value={draft.prices[key]}
                      onChange={(event) => patch({ prices: { ...draft.prices, [key]: event.target.value } })}
                      aria-invalid={Boolean(errors.prices) && !(Number(draft.prices[key]) > 0)}
                      aria-describedby={`${id}-price-hint`}
                      className="h-11 rounded-[10px] pl-7"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p id={`${id}-price-hint`} className={errors.prices ? "mt-2 text-xs text-destructive" : "mt-2 text-xs text-muted-foreground"}>
              {errors.prices ??
                `You earn the lesson price minus Thanodi’s fee of ${PLACEHOLDERS.FEE_RATE}%. For a 60-minute lesson you receive ${PLACEHOLDERS.TUTOR_NET}.`}
            </p>
            <label className="mt-4 flex items-start gap-3 text-sm text-foreground">
              <Checkbox
                checked={draft.freeTrial}
                onCheckedChange={(checked) => patch({ freeTrial: checked === true })}
                className="mt-0.5"
              />
              Offer a free 20-minute trial lesson to new students
            </label>
          </section>

          <section aria-labelledby={`${id}-verify`} className="rounded-xl border border-border bg-card p-5 md:p-6">
            <h2 id={`${id}-verify`} className="mb-2 text-[17px] font-bold text-foreground">
              Verification
            </h2>
            <dl className="divide-y divide-border">
              {(
                [
                  ["National ID (Omang)", tutor.verification.id],
                  ["Teaching qualification", tutor.verification.qualification],
                  ["Background check", tutor.verification.background],
                ] as const
              ).map(([label, state]) => (
                <div key={label} className="flex items-center justify-between gap-3 py-3 last:pb-0">
                  <dt className="text-sm font-medium text-foreground">{label}</dt>
                  <dd>
                    <StatusPill tone={VERIFY_PILL[state].tone}>{VERIFY_PILL[state].label}</StatusPill>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </form>

        <aside aria-labelledby={`${id}-preview`} className="flex max-w-md flex-col gap-3 xl:sticky xl:top-8 xl:max-w-none">
          <p id={`${id}-preview`} className="text-[11px] font-bold tracking-[0.07em] text-muted-foreground uppercase">
            Preview · how parents see you
          </p>
          <TutorCard tutor={preview} variant="preview" tags={previewTags(preview.offerings, tutor.verification, preview.languages)} />
          <Link href="/tutor/calendar" className="text-sm font-semibold text-primary underline underline-offset-2">
            Set when parents can book you →
          </Link>
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
