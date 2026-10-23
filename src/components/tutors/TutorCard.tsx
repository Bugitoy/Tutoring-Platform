import Link from "next/link";
import { Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { Tag } from "@/components/shared/Tag";
import { formatNextFree, formatPricePerHour } from "@/lib/format";
import { MOCK_NOW_ISO } from "@/lib/mock/ids";
import { tutorTags } from "@/lib/matching";
import type { Tutor, TutorFilter } from "@/lib/types";

type TutorCardProps = { tutor: Tutor } & (
  | { variant?: "search"; filter: TutorFilter; bookHref: string }
  /** Tutor · Profile & pricing: explicit tags, all of them shown, and a Book button that goes nowhere. */
  | { variant: "preview"; tags: string[] }
);

export function TutorCard(props: TutorCardProps) {
  const { tutor } = props;
  const tags =
    props.variant === "preview" ? props.tags.map((label) => ({ label, matched: false })) : tutorTags(tutor, props.filter);
  const shown = props.variant === "preview" ? tags : tags.slice(0, 3);
  const extra = tags.length - shown.length;

  return (
    <article className="flex flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <Avatar initials={tutor.initials} />
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-foreground">{tutor.fullName}</h3>
          <p className="truncate text-[13px] text-muted-foreground">{tutor.headline}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {shown.map((tag) => (
          <Tag key={tag.label} matched={tag.matched}>
            {tag.label}
          </Tag>
        ))}
        {extra > 0 ? <Tag>+{extra} more</Tag> : null}
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-text-secondary">{tutor.bio}</p>

      <p className="mt-3 flex flex-wrap items-center gap-x-1 text-[13px] text-muted-foreground">
        <Star size={14} className="fill-highlight-border text-highlight-border" aria-hidden="true" />
        <span className="font-bold text-foreground">{tutor.rating.toFixed(1)}</span>
        <span>· {tutor.lessonsTaught} lessons</span>
        {tutor.nextFreeSlot ? <span>· Next free: {formatNextFree(tutor.nextFreeSlot, MOCK_NOW_ISO)}</span> : null}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-lg font-bold text-foreground">{formatPricePerHour(tutor.prices.min60)}</p>
        {props.variant === "preview" ? (
          <span aria-hidden="true" className={buttonVariants({ className: "pointer-events-none" })}>
            Book lesson
          </span>
        ) : (
          <Link href={props.bookHref} className={buttonVariants()}>
            Book lesson
          </Link>
        )}
      </div>
    </article>
  );
}
