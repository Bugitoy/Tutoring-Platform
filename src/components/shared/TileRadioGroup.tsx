"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "cn";

export type TileOption<T extends string> = { value: T; label: string; description?: string };

type TileRadioGroupProps<T extends string> = {
  value: T;
  options: TileOption<T>[];
  onChange: (value: T) => void;
  label: string;
  /** "compact" is a single row of small tiles, e.g. attendance. */
  size?: "default" | "compact";
  className?: string;
};

/** Big selectable radio tiles: Who's paying, Attendance, Video quality. */
export function TileRadioGroup<T extends string>({
  value,
  options,
  onChange,
  label,
  size = "default",
  className,
}: TileRadioGroupProps<T>) {
  return (
    <RadioGroup
      aria-label={label}
      value={value}
      onValueChange={(next) => {
        const picked = options.find((option) => option.value === next);
        if (picked) onChange(picked.value);
      }}
      className={cn(size === "compact" ? "flex flex-wrap gap-2" : "grid gap-3 sm:grid-cols-2", className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer rounded-xl",
              size === "compact" ? "min-h-11 items-center gap-2 px-3 py-2 whitespace-nowrap" : "gap-3 p-4",
              selected ? "border-2 border-primary bg-accent" : "border border-input bg-card",
            )}
          >
            <RadioGroupItem value={option.value} className={size === "compact" ? "size-4" : "mt-0.5 size-5"} />
            <span>
              <span className={cn("block text-sm text-foreground", selected ? "font-semibold" : "font-medium")}>
                {option.label}
              </span>
              {option.description ? (
                <span className="mt-1 block text-sm text-muted-foreground">{option.description}</span>
              ) : null}
            </span>
          </label>
        );
      })}
    </RadioGroup>
  );
}
