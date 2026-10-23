import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/Avatar";
import { NavyCard } from "@/components/shared/NavyCard";
import { SectionCard } from "@/components/shared/SectionCard";
import { PLACEHOLDERS } from "@/config/placeholders";
import { formatBookingWhen, formatMoney } from "@/lib/format";

type OrderSummaryProps = {
  initials: string;
  name: string;
  subjectLabel: string;
  start: string | null;
  price: number;
  policy: string;
  submitLabel: string;
  pending: boolean;
  disabled: boolean;
  formId?: string;
  onPress?: () => void;
  paymentsHref: string;
};

export function OrderSummary({
  initials,
  name,
  subjectLabel,
  start,
  price,
  policy,
  submitLabel,
  pending,
  disabled,
  formId,
  onPress,
  paymentsHref,
}: OrderSummaryProps) {
  const amount = formatMoney(price, true);

  return (
    <div className="flex flex-col gap-4">
      <SectionCard>
        <div className="flex items-center gap-3">
          <Avatar initials={initials} size={48} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{name}</p>
            <p className="truncate text-[13px] text-muted-foreground">{subjectLabel}</p>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Date</dt>
          <dd className="text-right font-semibold text-foreground">{start ? formatBookingWhen(start) : "Pick a time"}</dd>
          <dt className="text-muted-foreground">Length</dt>
          <dd className="text-right font-semibold text-foreground">60 minutes</dd>
          <dt className="text-muted-foreground">Format</dt>
          <dd className="text-right font-semibold text-foreground">Live video + whiteboard</dd>
          <dt className="text-muted-foreground">Lesson</dt>
          <dd className="text-right font-semibold text-foreground">{amount}</dd>
        </dl>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <p className="font-bold text-foreground">Total</p>
          <p className="font-bold text-foreground">{amount}</p>
        </div>
        <Button
          type={formId ? "submit" : "button"}
          form={formId}
          size="page"
          className="mt-4 w-full"
          disabled={disabled || pending}
          onClick={formId ? undefined : onPress}
        >
          {pending ? "Please wait…" : submitLabel}
        </Button>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{policy}</p>
      </SectionCard>

      <NavyCard eyebrow="Thanodi Plus">
        <p className="text-base font-bold text-on-navy">Past papers, saved lesson notes and the AI study helper</p>
        <p className="mt-1 text-sm text-on-navy-muted">{PLACEHOLDERS.PLUS_PRICE} per month · cancel any time</p>
        <Link
          href={paymentsHref}
          className="mt-4 inline-flex h-11 items-center rounded-md bg-brand-sky px-4 text-sm font-bold text-brand-sky-foreground"
        >
          See what’s included
        </Link>
      </NavyCard>
    </div>
  );
}
