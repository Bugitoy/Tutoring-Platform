"use client";

import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import type { LeaderboardPeriod, LeaderboardScope } from "@/lib/types";

const SCOPES: { value: LeaderboardScope; label: string }[] = [
  { value: "school", label: "My school" },
  { value: "botswana", label: "Botswana" },
  { value: "global", label: "Global" },
];

const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "month", label: "This month" },
  { value: "all", label: "All time" },
];

type LeaderboardFiltersProps = {
  scope: LeaderboardScope;
  subject: string;
  period: LeaderboardPeriod;
  subjects: { value: string; label: string }[];
};

export function LeaderboardFilters({ scope, subject, period, subjects }: LeaderboardFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [state, setState] = useOptimistic({ scope, subject, period });

  function update(next: Partial<typeof state>) {
    const merged = { ...state, ...next };
    const params = new URLSearchParams(searchParams.toString());
    params.set("scope", merged.scope);
    params.set("subject", merged.subject);
    params.set("period", merged.period);
    startTransition(() => {
      setState(merged);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
      <div className="w-full sm:w-72">
        <SegmentedControl
          label="Where"
          value={state.scope}
          options={SCOPES}
          onChange={(value) => update({ scope: value })}
        />
      </div>
      <Select value={state.subject} onValueChange={(value) => update({ subject: String(value) })}>
        <SelectTrigger aria-label="Subject" className="h-11 min-w-36 flex-1 rounded-[10px] bg-card sm:flex-none">
          <span className="truncate">{subjects.find((item) => item.value === state.subject)?.label ?? "Subject"}</span>
        </SelectTrigger>
        <SelectContent>
          {subjects.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={state.period} onValueChange={(value) => update({ period: value as LeaderboardPeriod })}>
        <SelectTrigger aria-label="Period" className="h-11 min-w-32 flex-1 rounded-[10px] bg-card sm:flex-none">
          <span className="truncate">{PERIODS.find((item) => item.value === state.period)?.label}</span>
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
