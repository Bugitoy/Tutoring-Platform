"use client";

import { useId, useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { updateMonthlyStatement } from "@/lib/actions/payments";

export function MonthlyStatementCheckbox({ checked }: { checked: boolean }) {
  const id = useId();
  const [, startTransition] = useTransition();
  const [value, setValue] = useOptimistic(checked);

  return (
    <div className="flex items-center gap-2.5">
      <Checkbox
        id={id}
        checked={value}
        onCheckedChange={(next) =>
          startTransition(async () => {
            setValue(next === true);
            const result = await updateMonthlyStatement(next === true);
            if (!result.ok) toast.error(result.error);
            else toast.success(next ? "We’ll email you a statement each month" : "Monthly statements turned off");
          })
        }
        className="size-5"
      />
      <label htmlFor={id} className="text-sm text-foreground">
        Email me a monthly statement
      </label>
    </div>
  );
}
