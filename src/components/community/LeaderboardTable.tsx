import { Fragment } from "react";
import { Avatar } from "@/components/shared/Avatar";
import { cn } from "cn";
import type { LeaderboardRow } from "@/lib/types";

const MEDALS: Record<number, { className: string; label: string }> = {
  1: { className: "bg-medal-gold", label: "Gold" },
  2: { className: "bg-medal-silver", label: "Silver" },
  3: { className: "bg-medal-bronze", label: "Bronze" },
};

const HEAD = "px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-muted-foreground uppercase";

export function LeaderboardTable({ rows, caption }: { rows: LeaderboardRow[]; caption: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className={cn(HEAD, "w-16")}>Rank</th>
              <th scope="col" className={HEAD}>Helper</th>
              <th scope="col" className={HEAD}>School</th>
              <th scope="col" className={cn(HEAD, "text-right")}>Verified answers</th>
              <th scope="col" className={cn(HEAD, "text-right")}>Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const medal = MEDALS[row.rank];
              const gap = index > 0 && row.rank - rows[index - 1].rank > 1;
              return (
                <Fragment key={row.userId}>
                  {gap ? (
                    <tr aria-hidden="true" className="border-t border-border">
                      <td colSpan={5} className="px-4 py-1 text-center text-muted-foreground">
                        ⋯
                      </td>
                    </tr>
                  ) : null}
                  <tr className={cn("border-t border-border", row.isYou && "bg-you-row")}>
                    <td className="px-4 py-3">
                      {medal ? (
                        <span
                          className={cn(
                            "inline-flex size-7 items-center justify-center rounded-full text-xs font-bold text-foreground",
                            medal.className,
                          )}
                        >
                          <span className="sr-only">{medal.label}, rank </span>
                          {row.rank}
                        </span>
                      ) : (
                        <span className="inline-flex w-7 justify-center text-text-secondary">{row.rank}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar initials={row.initials} size={36} />
                        <div>
                          <p className="font-semibold text-foreground">{row.isYou ? `You · ${row.name}` : row.name}</p>
                          <p className="text-xs text-muted-foreground">{row.levelLabel}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{row.school}</td>
                    <td className="px-4 py-3 text-right text-text-secondary">{row.verifiedAnswers}</td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">{row.points.toLocaleString("en-GB")}</td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
