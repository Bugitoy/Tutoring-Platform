"use client";

import { useId } from "react";
import { Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type PermissionSwitchRowProps = {
  label: string;
  hint?: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  /** Held on or off by Thanodi's rules; shown but can't be changed. */
  locked?: boolean;
};

export function PermissionSwitchRow({ label, hint, checked, onChange, locked = false }: PermissionSwitchRowProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-sm font-medium text-foreground">
          {label}
        </label>
        {hint || locked ? (
          <p id={`${id}-hint`} className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            {locked ? <Lock className="size-3 shrink-0" aria-hidden="true" /> : null}
            {hint}
            {locked ? <span className="sr-only">. This setting can’t be changed.</span> : null}
          </p>
        ) : null}
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={locked}
        onCheckedChange={(next) => onChange?.(next)}
        aria-describedby={hint || locked ? `${id}-hint` : undefined}
      />
    </div>
  );
}
