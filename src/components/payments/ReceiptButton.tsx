"use client";

import { toast } from "sonner";
import { PLACEHOLDERS } from "@/config/placeholders";

// TODO(spec): receipts come from the payment provider (section 16.4); there is nothing to download until it is chosen.
export function ReceiptButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={`Receipt for ${label}`}
      onClick={() => toast.info(`Receipts download from ${PLACEHOLDERS.PAYMENT_PROVIDER} once payments are connected.`)}
      className="text-[13px] font-semibold text-primary underline underline-offset-2"
    >
      PDF
    </button>
  );
}
