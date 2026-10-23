import Link from "next/link";
import { NavyCard } from "@/components/shared/NavyCard";
import { POINTS } from "@/lib/community";

type PointsCardProps = {
  points: number;
  /** "Level 3 · Maths helper · rank 12 in Botswana" */
  line: string;
};

export function PointsCard({ points, line }: PointsCardProps) {
  return (
    <NavyCard eyebrow="Your points">
      <p className="text-[28px] leading-none font-bold text-on-navy">{points.toLocaleString("en-GB")}</p>
      <p className="mt-2 text-[13px] text-on-navy-muted">{line}</p>
      <Link
        href="/student/community/leaderboard"
        className="mt-2 inline-flex text-sm font-semibold text-link-on-navy underline underline-offset-2"
      >
        See leaderboard
      </Link>
    </NavyCard>
  );
}

const POINT_ROWS = [
  { label: "Answer marked helpful", points: POINTS.helpful },
  { label: "Answer verified by a tutor", points: POINTS.verified },
  { label: "Clear, well-tagged question", points: POINTS.question },
];

export function HowPointsWorkCard() {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-3 text-[15px] font-bold text-foreground">How points work</h2>
      <dl className="flex flex-col gap-2 text-sm">
        {POINT_ROWS.map((row) => (
          <div key={row.label} className="flex justify-between gap-3">
            <dt className="text-text-secondary">{row.label}</dt>
            <dd className="font-bold text-foreground">+{row.points}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[13px] text-muted-foreground">
        Top helpers can be invited to tutor on Thanodi and earn from lessons.
      </p>
    </section>
  );
}

const RULES = [
  "Explain the steps, don’t just post the answer",
  "No phone numbers, social handles or emails",
  "No live exam or test questions",
  "Be kind. Report anything that isn’t",
];

export function CommunityRulesCard() {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-3 text-[15px] font-bold text-foreground">Community rules</h2>
      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-text-secondary">
        {RULES.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </section>
  );
}

export function StuckCard({ href }: { href: string }) {
  return (
    <section className="rounded-xl bg-accent p-5">
      <h2 className="mb-1.5 text-[15px] font-bold text-foreground">Stuck on a whole topic?</h2>
      <p className="text-sm text-text-secondary">A 1:1 video lesson with a tutor gets you unstuck faster.</p>
      <Link href={href} className="mt-2 inline-flex text-sm font-semibold text-primary underline underline-offset-2">
        Find a tutor
      </Link>
    </section>
  );
}
