"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { requestPayout } from "@/lib/actions/tutor";
import { formatMoney } from "@/lib/format";

export function PayoutActions({ canPayOut }: { canPayOut: boolean }) {
  const [pending, startTransition] = useTransition();

  function payOut() {
    startTransition(async () => {
      const result = await requestPayout();
      if (result.ok) {
        toast.success(`${formatMoney(result.amount, true)} is on its way to your account ending ${result.bankLast4}`);
      } else toast.error(result.error);
    });
  }

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      <Button variant="accent-navy" onClick={payOut} disabled={!canPayOut || pending}>
        {pending ? "Paying out…" : "Pay out now"}
      </Button>
      <Button variant="outline-navy" onClick={() => toast("Changing your bank account isn’t available yet.")}>
        Change bank account
      </Button>
    </div>
  );
}
