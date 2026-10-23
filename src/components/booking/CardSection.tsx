import { CardForm } from "@/components/booking/CardForm";
import type { SavedCard } from "@/lib/types";

type CardSectionProps = {
  step: number;
  formId: string;
  cardName: string;
  savedCard?: SavedCard;
  onSubmit: () => void;
};

export function CardSection({ step, formId, cardName, savedCard, onSubmit }: CardSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[17px] font-bold text-foreground">{step}. Pay with your card</h2>
        <div className="flex gap-2">
          <span className="rounded-md border border-border bg-surface-subtle px-2 py-1 text-[11px] font-bold tracking-wide">
            VISA
          </span>
          <span className="rounded-md border border-border bg-surface-subtle px-2 py-1 text-[11px] font-bold tracking-wide">
            Mastercard
          </span>
        </div>
      </div>
      <CardForm id={formId} defaultName={cardName} savedCard={savedCard} onSubmit={onSubmit} />
    </section>
  );
}
