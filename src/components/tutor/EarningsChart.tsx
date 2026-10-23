"use client";

import { Bar, BarChart, Cell, LabelList, XAxis } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { formatMoney } from "@/lib/format";
import type { EarningsWeek } from "@/lib/types";

const config = {
  amount: { label: "You earned", color: "var(--color-cat-1-light)" },
} satisfies ChartConfig;

export function EarningsChart({ weeks }: { weeks: EarningsWeek[] }) {
  const first = weeks[0];
  const last = weeks[weeks.length - 1];
  const summary =
    first && last
      ? `Bar chart of your weekly earnings after Thanodi’s fee, from the week of ${first.label} to the week of ${last.label}: ${weeks
          .map((week) => `${week.label} ${formatMoney(week.amount)}`)
          .join(", ")}.`
      : "No earnings yet.";

  return (
    <div role="img" aria-label={summary}>
      <ChartContainer config={config} className="aspect-auto h-48 w-full" aria-hidden="true">
        <BarChart data={weeks} margin={{ top: 22, right: 0, bottom: 0, left: 0 }} barCategoryGap="22%">
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={0} fontSize={11} />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]} isAnimationActive={false}>
            {weeks.map((week, index) => (
              <Cell
                key={week.weekStart}
                fill={index === weeks.length - 1 ? "var(--color-primary)" : "var(--color-amount)"}
              />
            ))}
            <LabelList
              dataKey="amount"
              position="top"
              offset={6}
              className="fill-foreground"
              fontSize={11}
              fontWeight={600}
              formatter={(value) => (typeof value === "number" ? formatMoney(value) : "")}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
