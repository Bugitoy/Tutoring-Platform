"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// TODO(spec): the helper-to-tutor application isn't designed yet; v1 only explains when it opens.
export function ApplyToTutorButton({ eligible }: { eligible: boolean }) {
  return (
    <Button
      type="button"
      onClick={() =>
        toast.info(
          eligible
            ? "Applications open at the end of the month. We’ll message you."
            : "Reach the top 10 helpers this month to apply. Keep answering!",
        )
      }
      className="mt-4 bg-brand-sky text-brand-sky-foreground hover:bg-brand-sky/90"
    >
      Apply to tutor
    </Button>
  );
}
