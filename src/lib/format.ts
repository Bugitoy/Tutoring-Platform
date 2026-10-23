import { addMinutes, differenceInMinutes, formatDistanceToNowStrict, isSameDay, isTomorrow, isYesterday } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

export const TIMEZONE = "Africa/Gaborone";
export const TIMEZONE_LABEL = "Botswana time (CAT)";

export function toGaborone(date: Date | string) {
  return toZonedTime(typeof date === "string" ? new Date(date) : date, TIMEZONE);
}

export function formatMoney(thebe: number, decimals = false): string {
  const pula = thebe / 100;
  const fractionDigits = decimals || !Number.isInteger(pula) ? 2 : 0;
  return `P${pula.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

export function formatPricePerHour(thebe: number): string {
  return `${formatMoney(thebe)} / hour`;
}

export function formatDateShort(iso: string): string {
  return formatInTimeZone(new Date(iso), TIMEZONE, "EEE d MMM");
}

export function formatDateLong(iso: string): string {
  return formatInTimeZone(new Date(iso), TIMEZONE, "EEEE d MMMM");
}

export function formatTime(iso: string): string {
  return formatInTimeZone(new Date(iso), TIMEZONE, "HH:mm");
}

export function gaboroneDate(iso: string | Date): string {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd");
}

export function addGaboroneDays(yyyyMmDd: string, days: number): string {
  const [year, month, day] = yyyyMmDd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** "Today 17:00", "Tomorrow 15:30", or "Thu 18:00". */
export function formatNextFree(iso: string, now: string | Date = new Date()): string {
  const day = gaboroneDate(iso);
  const today = gaboroneDate(now);
  const time = formatTime(iso);
  if (day === today) return `Today ${time}`;
  if (day === addGaboroneDays(today, 1)) return `Tomorrow ${time}`;
  return `${formatInTimeZone(new Date(iso), TIMEZONE, "EEE")} ${time}`;
}

export function formatDayButton(yyyyMmDd: string): { weekday: string; label: string } {
  const noon = new Date(`${yyyyMmDd}T12:00:00+02:00`);
  return {
    weekday: formatInTimeZone(noon, TIMEZONE, "EEE"),
    label: formatInTimeZone(noon, TIMEZONE, "d MMM"),
  };
}

/** "20 Oct" */
export function formatDayMonth(iso: string): string {
  return formatInTimeZone(new Date(iso), TIMEZONE, "d MMM");
}

/** "Thu 23 Oct, 17:00" */
export function formatBookingWhen(iso: string): string {
  return formatInTimeZone(new Date(iso), TIMEZONE, "EEE d MMM, HH:mm");
}

function ymdNoon(yyyyMmDd: string) {
  return new Date(`${yyyyMmDd}T12:00:00+02:00`);
}

/** "Thursday 22 October" from "2026-10-22". */
export function formatYmdLong(yyyyMmDd: string): string {
  return formatInTimeZone(ymdNoon(yyyyMmDd), TIMEZONE, "EEEE d MMMM");
}

/** "October", or "January 2027" when the month is not in the current year. */
export function formatMonthTitle(yyyyMm: string, todayYmd: string): string {
  const date = ymdNoon(`${yyyyMm}-01`);
  return formatInTimeZone(date, TIMEZONE, yyyyMm.slice(0, 4) === todayYmd.slice(0, 4) ? "MMMM" : "MMMM yyyy");
}

/** "Today", "Tomorrow" or "Yesterday" when it applies. */
export function relativeDayWord(iso: string, now: string): "Today" | "Tomorrow" | "Yesterday" | null {
  const day = gaboroneDate(iso);
  const today = gaboroneDate(now);
  if (day === today) return "Today";
  if (day === addGaboroneDays(today, 1)) return "Tomorrow";
  if (day === addGaboroneDays(today, -1)) return "Yesterday";
  return null;
}

/** "Today, 17:00", "Tomorrow 15:30" or "Wed 28 Oct, 16:00". */
export function formatLessonWhen(iso: string, now: string): string {
  const word = relativeDayWord(iso, now);
  if (word === "Today") return `Today, ${formatTime(iso)}`;
  if (word === "Tomorrow") return `Tomorrow ${formatTime(iso)}`;
  return formatBookingWhen(iso);
}

/** "Thursday, 22 October" (Tutor · Today header). */
export function formatDayHeading(iso: string): string {
  return formatInTimeZone(new Date(iso), TIMEZONE, "EEEE, d MMMM");
}

/** "Today" or "Tue 20 Oct". */
export function formatLessonDay(iso: string, now: string): string {
  return relativeDayWord(iso, now) === "Today" ? "Today" : formatDateShort(iso);
}

export function formatWeekday(iso: string, style: "short" | "long" = "short"): string {
  return formatInTimeZone(new Date(iso), TIMEZONE, style === "short" ? "EEE" : "EEEE");
}

export function formatDayNumber(iso: string): string {
  return formatInTimeZone(new Date(iso), TIMEZONE, "d");
}

export function formatFileSize(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

/** "Ms. Kagiso Molefe" → "Ms. Molefe"; names without a title stay as they are. */
export function tutorShortName(fullName: string): string {
  const parts = fullName.split(" ");
  if (parts.length > 2 && /\.$/.test(parts[0])) return `${parts[0]} ${parts[parts.length - 1]}`;
  return fullName;
}

export function formatTimeRange(startIso: string, durationMin: number): string {
  const end = addMinutes(new Date(startIso), durationMin);
  return `${formatTime(startIso)}–${formatInTimeZone(end, TIMEZONE, "HH:mm")}`;
}

export function formatRelative(iso: string, now: Date | string = new Date()): string {
  const date = new Date(iso);
  const nowDate = typeof now === "string" ? new Date(now) : now;
  const zonedDate = toGaborone(date);
  const zonedNow = toGaborone(nowDate);

  if (isSameDay(zonedDate, zonedNow)) {
    return `Today, ${formatTime(iso)}`;
  }
  if (isTomorrow(zonedDate)) {
    return `Tomorrow ${formatTime(iso)}`;
  }
  if (isYesterday(zonedDate)) {
    return "Yesterday";
  }
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function formatCountdown(startIso: string, now: Date | string = new Date()) {
  const minutes = Math.max(0, differenceInMinutes(new Date(startIso), typeof now === "string" ? new Date(now) : now));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const body = hours > 0 ? `${hours} h ${mins} min` : `${mins} min`;
  return {
    eyebrow: `STARTS IN ${body.toUpperCase()}`,
    pill: `Starts in ${body}`,
  };
}

/** "35 min ago", "2 h ago" / "2 hours ago", "Yesterday", or "18 Oct" for older dates. */
export function formatAgo(iso: string, now: string, style: "short" | "long" = "short"): string {
  const minutes = Math.max(0, differenceInMinutes(new Date(now), new Date(iso)));
  const word = relativeDayWord(iso, now);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (word === "Today") {
    const hours = Math.floor(minutes / 60);
    if (style === "short") return `${hours} h ago`;
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (word === "Yesterday") return "Yesterday";
  return formatDayMonth(iso);
}

/** Thread list times: "15:42", "Yesterday", "Mon" within the last week, otherwise "12 Oct". */
export function formatThreadTime(iso: string, now: string): string {
  const day = gaboroneDate(iso);
  const today = gaboroneDate(now);
  if (day === today) return formatTime(iso);
  if (day === addGaboroneDays(today, -1)) return "Yesterday";
  if (day > addGaboroneDays(today, -7) && day < today) return formatWeekday(iso);
  return formatDayMonth(iso);
}

/** ["Neo", "Lesego"] → "Neo and Lesego"; three or more get commas. */
export function listNames(names: string[]): string {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** "Neo Seretse" → "Neo S."; names that are already short stay as they are. */
export function shortPersonName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2 || parts[parts.length - 1].endsWith(".")) return fullName;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export function formatPhone(local: string): string {
  const digits = local.replace(/\D/g, "");
  if (digits.length === 8) {
    return `+267 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  return `+267 ${local}`;
}

export function formatCard(brand: SavedCardBrand, last4: string): string {
  const label = brand === "mastercard" ? "MC" : "Visa";
  return `${label} •••• ${last4}`;
}

export function offeringLabel(curriculumName: string, subjectName?: string, entire?: boolean): string {
  if (entire) return `${curriculumName} · Entire curriculum`;
  return `${curriculumName} · ${subjectName ?? ""}`;
}

type SavedCardBrand = "visa" | "mastercard";
