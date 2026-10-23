import type { ReactNode } from "react";
import Link from "next/link";
import { StatusPill } from "@/components/shared/StatusPill";
import { buttonVariants } from "@/components/ui/button";
import type { OfferView } from "./types";

type LessonOfferCardProps = OfferView & {
  draft?: boolean;
  /** Extra controls under the card, e.g. "Remove" on a draft. */
  footer?: ReactNode;
};

export function LessonOfferCard({ when, priceLine, acceptHref, pill, draft = false, footer }: LessonOfferCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border-2 border-primary bg-card px-4 py-3 text-left">
      <p className="text-[11px] font-bold tracking-[0.07em] text-primary uppercase">
        Lesson offer{draft ? " · Draft" : ""}
      </p>
      <p className="text-[15px] font-bold text-foreground">{when}</p>
      <p className="text-xs text-muted-foreground">{priceLine}</p>
      {acceptHref || pill || footer ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {acceptHref ? (
            <Link href={acceptHref} className={buttonVariants({ size: "sm" })}>
              Accept and pay
            </Link>
          ) : null}
          {pill ? <StatusPill tone={pill.tone}>{pill.label}</StatusPill> : null}
          {footer}
        </div>
      ) : null}
    </div>
  );
}
