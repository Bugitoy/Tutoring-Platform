"use client";

import { useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { CardForm } from "@/components/booking/CardForm";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { saveNewCard } from "@/lib/actions/payments";
import type { SavedCard } from "@/lib/types";

type AddCardDialogProps = {
  role: "student" | "parent";
  cardName: string;
};

function brandOf(digits: string): SavedCard["brand"] | null {
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  return null;
}

export function AddCardDialog({ role, cardName }: AddCardDialogProps) {
  const id = useId();
  const formId = `${id}-card`;
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(data: FormData) {
    const digits = String(data.get("number") ?? "").replace(/\D/g, "");
    const expiry = String(data.get("expiry") ?? "").replace(/\s/g, "");
    const brand = brandOf(digits);
    if (digits.length < 13 || digits.length > 19) return setError("Enter the full card number.");
    if (!brand) return setError("Thanodi accepts Visa and Mastercard.");
    setError(null);
    startTransition(async () => {
      const result = await saveNewCard(role, { brand, last4: digits.slice(-4), expiry });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(`Card ending ${result.last4} saved`);
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>+ Add card</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-bold">Add a card</DialogTitle>
          <DialogDescription>Visa or Mastercard, debit or credit.</DialogDescription>
        </DialogHeader>
        <CardForm id={formId} defaultName={cardName} showSaveOption={false} onSubmit={submit} />
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={pending}>
            {pending ? "Saving…" : "Save card"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
