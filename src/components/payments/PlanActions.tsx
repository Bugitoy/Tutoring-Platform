"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// TODO(spec): plan management isn't designed yet (section 16.2); both buttons only explain that for now.
export function PlanActions() {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button
        type="button"
        onClick={() => toast.info("Plan changes open here once Thanodi Plus pricing is set.")}
        className="bg-brand-sky text-brand-sky-foreground hover:bg-brand-sky/90"
      >
        Manage plan
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => toast.info("Cancelling opens here once Thanodi Plus pricing is set. Your plan stays active.")}
        className="border-navy-border bg-transparent text-on-navy hover:bg-navy-raised hover:text-on-navy"
      >
        Cancel
      </Button>
    </div>
  );
}
