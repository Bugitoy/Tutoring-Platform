"use client";

import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

export type ReportPeriod = "term" | "30d" | "all";

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "term", label: "This term" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

type ReportFiltersProps = {
  subject: string;
  subjects: { value: string; label: string }[];
  period: ReportPeriod;
};

export function ReportFilters({ subject, subjects, period }: ReportFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [state, setState] = useOptimistic({ subject, period });

  function update(next: Partial<typeof state>) {
    const merged = { ...state, ...next };
    const params = new URLSearchParams(searchParams.toString());
    params.set("subject", merged.subject);
    params.set("period", merged.period);
    startTransition(() => {
      setState(merged);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  const subjectLabel = state.subject === "all" ? "All subjects" : (subjects.find((item) => item.value === state.subject)?.label ?? "All subjects");
  const periodLabel = PERIODS.find((item) => item.value === state.period)?.label ?? "This term";

  return (
    <div className="flex flex-wrap gap-3">
      <label className="flex flex-col gap-1 text-[13px] font-medium text-foreground">
        Subject
        <Select value={state.subject} onValueChange={(value) => update({ subject: String(value) })}>
          <SelectTrigger className="h-11 min-w-36 rounded-[10px]">
            <span className="truncate">{subjectLabel}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-[13px] font-medium text-foreground">
        Period
        <Select value={state.period} onValueChange={(value) => update({ period: value as ReportPeriod })}>
          <SelectTrigger className="h-11 min-w-36 rounded-[10px]">
            <span className="truncate">{periodLabel}</span>
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    </div>
  );
}
