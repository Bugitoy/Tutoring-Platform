import { formatDayNumber, formatWeekday } from "@/lib/format";

export function DateTile({ iso }: { iso: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-accent text-accent-foreground"
    >
      <span className="text-[10px] leading-3 font-bold uppercase">{formatWeekday(iso)}</span>
      <span className="text-[17px] leading-5 font-bold">{formatDayNumber(iso)}</span>
    </span>
  );
}
