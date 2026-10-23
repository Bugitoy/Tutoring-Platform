"use client";

import { useId, useState } from "react";
import { cn } from "cn";
import { Checkbox } from "@/components/ui/checkbox";

type CheckboxCardProps = {
  label: string;
  defaultChecked?: boolean;
  tone?: "accent" | "card";
};

export function CheckboxCard({ label, defaultChecked = true, tone = "accent" }: CheckboxCardProps) {
  const id = useId();
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl p-4",
        tone === "accent" ? "bg-accent" : "border border-border bg-card",
      )}
    >
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => setChecked(value === true)} className="mt-0.5" />
      <label htmlFor={id} className="text-sm leading-snug text-foreground">
        {label}
      </label>
    </div>
  );
}
