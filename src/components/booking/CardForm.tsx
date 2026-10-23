"use client";

import { Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLACEHOLDERS } from "@/config/placeholders";
import type { SavedCard } from "@/lib/types";

/**
 * Mock card fields. The payment provider's hosted fields replace this component;
 * booking actions never receive the card number.
 */
type CardFormProps = {
  id: string;
  defaultName: string;
  savedCard?: SavedCard;
  /** Hidden when the form only saves a card, e.g. "+ Add card" on Payments. */
  showSaveOption?: boolean;
  onSubmit: (data: FormData) => void;
};

export function CardForm({ id, defaultName, savedCard, showSaveOption = true, onSubmit }: CardFormProps) {
  return (
    <form
      id={id}
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget));
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-name`}>Name on card</Label>
        <Input id={`${id}-name`} name="name" required defaultValue={defaultName} className="h-11 rounded-[10px]" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-number`}>Card number</Label>
        <Input
          id={`${id}-number`}
          name="number"
          required
          inputMode="numeric"
          autoComplete="off"
          defaultValue={savedCard ? `•••• •••• •••• ${savedCard.last4}` : ""}
          placeholder="Card number"
          className="h-11 rounded-[10px]"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-expiry`}>Expiry</Label>
          <Input
            id={`${id}-expiry`}
            name="expiry"
            required
            defaultValue={savedCard?.expiry ?? ""}
            placeholder="MM / YY"
            className="h-11 rounded-[10px]"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-cvc`}>Security code</Label>
          <Input
            id={`${id}-cvc`}
            name="cvc"
            required
            inputMode="numeric"
            autoComplete="off"
            placeholder="•••"
            className="h-11 rounded-[10px]"
          />
        </div>
      </div>
      {showSaveOption ? (
        <label className="flex items-center gap-2.5 text-sm text-foreground">
          <Checkbox name="save" defaultChecked className="size-5" />
          Save this card for future lessons
        </label>
      ) : null}
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Lock size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          Card details are handled securely by {PLACEHOLDERS.PAYMENT_PROVIDER}. Thanodi never stores your full card
          number.
        </span>
      </p>
    </form>
  );
}
