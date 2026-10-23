"use client";

import { toast } from "sonner";
import { StatusPill } from "@/components/shared/StatusPill";
import { Button } from "@/components/ui/button";

type AccountSecurityCardProps = {
  headingId: string;
  /** Student: "Signed in on 2 devices". Parent: two-step pill and data download. */
  variant: "student" | "parent";
  twoStepSms?: boolean;
};

// TODO(spec): password, sessions and data export screens aren't designed yet (section 16); each button only explains for now.
export function AccountSecurityCard({ headingId, variant, twoStepSms }: AccountSecurityCardProps) {
  const rows =
    variant === "student"
      ? [
          { label: "Password", action: "Change password", note: "Changing your password opens here once sign-in is connected." },
          { label: "Signed in on 2 devices", action: "Sign out everywhere", note: "Signing out other devices works once sign-in is connected." },
        ]
      : [
          { label: "Password", action: "Change password", note: "Changing your password opens here once sign-in is connected." },
          { label: "Download all my data", action: "Request download", note: "We’ll email you a download link within 30 days once this is connected." },
        ];

  return (
    <section aria-labelledby={headingId} className="rounded-xl border border-border bg-card p-5 md:p-6">
      <h2 id={headingId} className="mb-2 text-[17px] font-bold text-foreground">
        Account &amp; security
      </h2>
      <dl className="divide-y divide-border">
        {rows.slice(0, 1).map((row) => (
          <Row key={row.label} {...row} />
        ))}
        {variant === "parent" ? (
          <div className="flex items-center justify-between gap-3 py-3">
            <dt className="text-sm text-foreground">Two-step sign-in by SMS</dt>
            <dd>
              <StatusPill tone={twoStepSms ? "success" : "neutral"}>{twoStepSms ? "On" : "Off"}</StatusPill>
            </dd>
          </div>
        ) : null}
        {rows.slice(1).map((row) => (
          <Row key={row.label} {...row} />
        ))}
      </dl>
    </section>
  );
}

function Row({ label, action, note }: { label: string; action: string; note: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 last:pb-0">
      <dt className="text-sm text-foreground">{label}</dt>
      <dd>
        <Button type="button" variant="outline" size="sm" onClick={() => toast.info(note)}>
          {action}
        </Button>
      </dd>
    </div>
  );
}
