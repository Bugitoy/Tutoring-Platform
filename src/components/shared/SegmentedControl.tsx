"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "cn";

type Option<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  label: string;
};

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroup
      aria-label={label}
      value={[value]}
      onValueChange={(next) => {
        const picked = next.find((item) => item !== value) ?? next[0];
        if (picked) onChange(picked as T);
      }}
      spacing={4}
      className="flex w-full rounded-xl bg-divider-soft p-1"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className={cn(
            "h-auto min-h-9 flex-1 rounded-lg border-0 bg-transparent px-2 py-2 text-center text-[13px] font-medium whitespace-normal text-muted-foreground hover:bg-transparent hover:text-foreground",
            "aria-pressed:bg-card aria-pressed:font-bold aria-pressed:text-primary aria-pressed:shadow-[0_1px_2px_color-mix(in_srgb,var(--foreground)_15%,transparent)]",
          )}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
