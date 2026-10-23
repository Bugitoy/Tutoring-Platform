"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterChip } from "@/components/shared/FilterChip";
import { NavyCard } from "@/components/shared/NavyCard";
import { NoticeBox } from "@/components/shared/NoticeBox";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { Tag } from "@/components/shared/Tag";
import { PLACEHOLDERS } from "@/config/placeholders";
import { formatMoney, formatPricePerHour } from "@/lib/format";

const SWATCHES = [
  ["background", "bg-background border border-border"],
  ["card", "bg-card border border-border"],
  ["primary", "bg-primary"],
  ["accent", "bg-accent"],
  ["brand-sky", "bg-brand-sky"],
  ["navy", "bg-navy"],
  ["success", "bg-status-success-bg"],
  ["warning", "bg-status-warning-bg"],
  ["danger", "bg-status-danger-bg"],
  ["cat-1", "bg-cat-1"],
  ["cat-2", "bg-cat-2"],
  ["cat-3", "bg-cat-3"],
] as const;

export function FoundationsGallery() {
  const [maths, setMaths] = useState(true);
  const [physics, setPhysics] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-10 md:py-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.07em] text-primary uppercase">M0 · Foundations</p>
          <h1 className="mt-1 text-[28px] font-bold text-foreground">Thanodi tokens</h1>
          <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">
            Every colour here comes from a CSS variable. No hex values in components.
          </p>
        </div>
        <div className="flex size-8 items-center justify-center rounded-md bg-brand-sky text-sm font-bold text-brand-sky-foreground">
          T
        </div>
      </header>

      <SectionCard title="Colour tokens">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {SWATCHES.map(([name, cls]) => (
            <div key={name} className="flex flex-col gap-2">
              <div className={`h-12 rounded-lg ${cls}`} />
              <p className="text-xs font-medium text-text-secondary">{name}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Leave lesson</Button>
          <Button disabled>Disabled</Button>
          <Button size="page">Pay {formatMoney(15000, true)} and book</Button>
        </div>
        <div className="mt-4 rounded-2xl bg-navy p-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="accent-navy">
              <Video />
              Join video lesson
            </Button>
            <Button variant="outline-navy">Reschedule</Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Chips and tags">
        <div className="flex flex-wrap gap-2">
          <FilterChip pressed={maths} onPressedChange={setMaths}>
            BGCSE Maths
          </FilterChip>
          <FilterChip pressed={physics} onPressedChange={setPhysics}>
            Physics
          </FilterChip>
          <FilterChip>Past papers</FilterChip>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag matched>BGCSE · Mathematics</Tag>
          <Tag>BSSE · General Mathematics</Tag>
          <Tag>+3 more</Tag>
        </div>
      </SectionCard>

      <SectionCard title="Status pills">
        <div className="flex flex-wrap gap-2">
          <StatusPill tone="success">Done</StatusPill>
          <StatusPill tone="info">Booked · paid</StatusPill>
          <StatusPill tone="warning">Waiting for Masego to pay</StatusPill>
          <StatusPill tone="danger">Missed</StatusPill>
          <StatusPill tone="neutral">Confirmed</StatusPill>
          <StatusPill tone="live">Live · 24:13</StatusPill>
        </div>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Lessons attended this term" value="11 of 12" progress={92} />
        <StatCard
          label="Earned this month"
          value={formatMoney(234000)}
          subline={<span className="text-status-success-fg">Paid out every Friday</span>}
        />
        <StatCard label="Next lesson" value="Today, 17:00" subline="Maths with Ms. Molefe · video" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Section card">
          <p className="text-sm leading-relaxed text-text-secondary">
            White card, 16px radius, 1px border, no shadow. Price {formatPricePerHour(15000)}.
            Provider {PLACEHOLDERS.PAYMENT_PROVIDER}.
          </p>
        </SectionCard>
        <NavyCard eyebrow="Next lesson · starts in 1 h 52 min">
          <h2 className="text-2xl font-bold">Quadratics, part 2</h2>
          <p className="mt-1 text-sm text-on-navy-muted">Today, 17:00–18:00 · Ms. Kagiso Molefe</p>
        </NavyCard>
      </div>

      <SectionCard
        title="Needs action"
        className="border-2 border-highlight-border"
      >
        <p className="text-sm text-text-secondary">
          2px highlight border for homework due, after-class reports and payment requests.
        </p>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2">
        <NoticeBox tone="info" lead="Matched to your learning profile">
          Form 4 · BGCSE · Mathematics
        </NoticeBox>
        <NoticeBox tone="warning">
          The helper can make mistakes. It explains steps rather than giving answers.
        </NoticeBox>
      </div>

      <EmptyState
        title="No lessons on this day."
        description="Pick another date, or book a lesson with a tutor."
        action={
          <Button variant="secondary" onClick={() => toast.success("Lesson booked")}>
            Book a lesson
          </Button>
        }
      />
    </div>
  );
}
