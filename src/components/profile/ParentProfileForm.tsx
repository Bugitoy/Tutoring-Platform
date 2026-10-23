"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Avatar } from "@/components/shared/Avatar";
import { NavyCard } from "@/components/shared/NavyCard";
import { NoticeBox } from "@/components/shared/NoticeBox";
import { Tag } from "@/components/shared/Tag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { PLACEHOLDERS } from "@/config/placeholders";
import { saveParentProfile } from "@/lib/actions/profile";
import { profileLine, subjectTags } from "@/lib/learningProfile";
import { lockedPermissions, type PermissionSwitch } from "@/lib/permissions";
import type { LearningProfile, ParentProfileInput, StudentPermissions } from "@/lib/types";
import { AccountSecurityCard } from "./AccountSecurityCard";
import { EditLearningProfileDialog } from "./EditLearningProfileDialog";
import { NotificationMatrix } from "./NotificationMatrix";
import { PermissionSwitchRow } from "./PermissionSwitchRow";
import { ProfileHeader } from "./ProfileHeader";

export type ChildView = {
  id: string;
  fullName: string;
  firstName: string;
  initials: string;
  isUnder18: boolean;
  pronoun?: "he" | "she";
  cardLast4?: string;
};

export type PlanView = {
  /** "Covers Neo and Lesego" */
  covers: string;
  /** "[PRICE] / month · renews 1 November" */
  line: string;
};

type ParentProfileFormProps = {
  initials: string;
  initial: ParentProfileInput;
  kids: ChildView[];
  plan?: PlanView;
  /** "Visa •••• 4821 · expires 08/28" */
  defaultCard?: string;
  twoStepSms: boolean;
};

type Errors = { fullName?: string; email?: string; phone?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LANGUAGES: ParentProfileInput["language"][] = ["English", "Setswana"];

function words(pronoun: ChildView["pronoun"]) {
  if (pronoun === "he") return { self: "himself", his: "his", He: "He", he: "he" };
  if (pronoun === "she") return { self: "herself", his: "her", He: "She", he: "she" };
  return { self: "themselves", his: "their", He: "They", he: "they" };
}

type Row = { key: PermissionSwitch; label: string; hint?: string };

function permissionRows(child: ChildView, profile: LearningProfile, permissions: StudentPermissions): Row[] {
  const w = words(child.pronoun);
  const primary = profile.level === "primary";
  const rows: Row[] = [
    {
      key: "canBook",
      label: `Find and book tutors ${w.self}`,
      hint: permissions.canBook ? "Bookings appear on your calendar" : `Only you book lessons for ${child.firstName}`,
    },
    {
      key: "canPayOwnCard",
      label: `Pay with ${w.his} own card`,
      hint: primary
        ? "Not available for primary learners"
        : child.cardLast4
          ? `Card ending ${child.cardLast4}`
          : `${w.He} can add a card in ${w.his} profile`,
    },
  ];
  if (primary) {
    rows.push({ key: "canJoinWithPin", label: `Join lessons from ${w.his} own login`, hint: `${w.He} signs in with a PIN you set` });
  } else {
    rows.push({
      key: "canRequestParentPayment",
      label: "Send payment requests to you",
      hint: `Up to ${PLACEHOLDERS.PARENT_REQUEST_LIMIT} per month`,
    });
  }
  rows.push({
    key: "parentSeesMessages",
    label: `You can see ${w.his} messages with tutors`,
    hint: child.isUnder18 ? `Always on while ${w.he} is under 18` : undefined,
  });
  return rows;
}

export function ParentProfileForm({ initials, initial, kids, plan, defaultCard, twoStepSms }: ParentProfileFormProps) {
  const id = useId();
  const formId = `${id}-form`;
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  function patchChild(childId: string, next: Partial<ParentProfileInput["children"][number]>) {
    setDraft((current) => ({
      ...current,
      children: current.children.map((entry) => (entry.id === childId ? { ...entry, ...next } : entry)),
    }));
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const found: Errors = {};
    if (!draft.fullName.trim()) found.fullName = "Enter your full name.";
    if (!EMAIL.test(draft.email.trim())) found.email = "Enter an email address like name@example.com.";
    const phone = draft.phone.replace(/\D/g, "");
    if (phone && !/^7\d{7}$/.test(phone)) found.phone = "Enter a Botswana mobile number: 8 digits starting with 7.";
    setErrors(found);
    const first = (["fullName", "email", "phone"] as const).find((key) => found[key]);
    if (first) {
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    startTransition(async () => {
      const result = await saveParentProfile(draft);
      if (result.ok) {
        setSaved(draft);
        toast.success("Profile saved. Your children’s permissions apply straight away.");
      } else toast.error(result.error);
    });
  }

  // TODO(spec): adding a child isn't designed yet (section 16).
  function addChild() {
    toast.info("Adding a child opens here once linking is designed.");
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
        line={`Parent · ${kids.length} ${kids.length === 1 ? "child" : "children"} linked`}
        actions={<div className="hidden lg:block">{saveButton}</div>}
      />

      <div className="grid items-start gap-6 pb-20 lg:pb-0 xl:grid-cols-[minmax(0,1fr)_340px]">
        <form id={formId} onSubmit={submit} noValidate className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby={`${id}-children`} className="rounded-xl border border-border bg-card p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id={`${id}-children`} className="text-[17px] font-bold text-foreground">
                Your children
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addChild}
              >
                + Add a child
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              {kids.map((child) => {
                const entry = draft.children.find((item) => item.id === child.id);
                if (!entry) return null;
                const locked = lockedPermissions(child, entry.learningProfile);
                return (
                  <article
                    key={child.id}
                    aria-labelledby={`${id}-${child.id}-name`}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar initials={child.initials} size={44} />
                        <div>
                          <h3 id={`${id}-${child.id}-name`} className="text-[15px] font-bold text-foreground">
                            {child.fullName}
                          </h3>
                          <p className="text-xs text-muted-foreground">{profileLine(entry.learningProfile)}</p>
                        </div>
                      </div>
                      <EditLearningProfileDialog
                        childName={child.firstName}
                        value={entry.learningProfile}
                        onApply={(learningProfile) => patchChild(child.id, { learningProfile })}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {subjectTags(entry.learningProfile).map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                    <div className="mt-4 border-t border-border pt-3">
                      <h4 className="text-[13px] font-bold text-foreground">What {child.firstName} can do</h4>
                      <div className="divide-y divide-border">
                        {permissionRows(child, entry.learningProfile, entry.permissions).map((row) => {
                          const held = locked[row.key];
                          return (
                            <PermissionSwitchRow
                              key={row.key}
                              label={row.label}
                              hint={row.hint}
                              locked={held !== undefined}
                              checked={held ?? Boolean(entry.permissions[row.key])}
                              onChange={(checked) =>
                                patchChild(child.id, { permissions: { ...entry.permissions, [row.key]: checked } })
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section aria-labelledby={`${id}-personal`} className="rounded-xl border border-border bg-card p-5 md:p-6">
            <h2 id={`${id}-personal`} className="mb-4 text-[17px] font-bold text-foreground">
              Personal details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor={`${id}-fullName`}>Full name</Label>
                <Input
                  id={`${id}-fullName`}
                  autoComplete="name"
                  value={draft.fullName}
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
                <Label htmlFor={`${id}-phone`}>Mobile number</Label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground"
                  >
                    +267
                  </span>
                  <Input
                    id={`${id}-phone`}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={draft.phone}
                    onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
                    placeholder="7X XXX XXX"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? `${id}-phone-error` : undefined}
                    className="h-11 rounded-[10px] pl-14"
                  />
                </div>
                {errors.phone ? (
                  <p id={`${id}-phone-error`} className="text-xs text-destructive">
                    {errors.phone}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-1.5">
                <span id={`${id}-language`} className="text-sm leading-none font-medium text-foreground">
                  Language
                </span>
                <Select
                  value={draft.language}
                  onValueChange={(value) => setDraft({ ...draft, language: value as ParentProfileInput["language"] })}
                >
                  <SelectTrigger aria-labelledby={`${id}-language`} className="h-11 w-full rounded-[10px]">
                    <span>{draft.language}</span>
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

          <section aria-labelledby={`${id}-notifications`} className="rounded-xl border border-border bg-card p-5 md:p-6">
            <h2 id={`${id}-notifications`} className="mb-3 text-[17px] font-bold text-foreground">
              Notifications
            </h2>
            <NotificationMatrix
              value={draft.notifications}
              onChange={(notifications) => setDraft({ ...draft, notifications })}
            />
          </section>

          <AccountSecurityCard headingId={`${id}-account`} variant="parent" twoStepSms={twoStepSms} />
        </form>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-8">
          {plan ? (
            <NavyCard eyebrow="Thanodi Plus · Active">
              <p className="text-[17px] font-bold text-on-navy">{plan.covers}</p>
              <p className="mt-1 text-[13px] text-on-navy-muted">{plan.line}</p>
              <Link
                href="/parent/payments"
                className="mt-2 inline-flex text-sm font-semibold text-link-on-navy underline underline-offset-2"
              >
                Manage plan
              </Link>
            </NavyCard>
          ) : null}

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-2 text-[15px] font-bold text-foreground">Default payment card</h2>
            <p className="text-sm text-text-secondary">{defaultCard ?? "No card saved yet"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Used for lessons you book and for your children’s payment requests.
            </p>
            <Link href="/parent/payments" className="mt-2 inline-flex text-sm font-semibold text-primary underline underline-offset-2">
              Manage cards
            </Link>
          </section>

          <NoticeBox lead="Child safety.">
            For children under 18 you can always see their lessons, reports and messages with tutors. This can’t be
            switched off.
          </NoticeBox>
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
