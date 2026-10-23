"use client";

import { useId, useState, useTransition } from "react";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";
import { TileRadioGroup } from "@/components/shared/TileRadioGroup";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendLessonReport } from "@/lib/actions/tutor";
import type { Report } from "@/lib/types";

const MIN_COMMENT = 30;
const MAX_TAKEAWAYS = 3;

const ATTENDANCE: { value: Report["attendance"]; label: string }[] = [
  { value: "on_time", label: "On time" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
];

type AfterClassReportFormProps = {
  lessonId: string;
  /** "Lesson with Neo Seretse · 15:00 · Quadratics, part 1" */
  subtitle: string;
  draft: {
    attendance: Report["attendance"];
    comment: string;
    homework: string;
    /** yyyy-mm-dd */
    homeworkDue: string;
    takeaways: string[];
    aiDrafted: boolean;
    attachment?: string;
  };
};

type Errors = Partial<Record<"comment" | "lateMinutes", string>>;

export function AfterClassReportForm({ lessonId, subtitle, draft }: AfterClassReportFormProps) {
  const id = useId();
  const [attendance, setAttendance] = useState(draft.attendance);
  const [lateMinutes, setLateMinutes] = useState("");
  const [comment, setComment] = useState(draft.comment);
  const [homework, setHomework] = useState(draft.homework);
  const [due, setDue] = useState(draft.homeworkDue);
  const [takeaways, setTakeaways] = useState(() =>
    Array.from({ length: MAX_TAKEAWAYS }, (_, index) => draft.takeaways[index] ?? ""),
  );
  const [checked, setChecked] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();

  const hasTakeaways = takeaways.some((line) => line.trim());

  function validate(): Errors {
    const next: Errors = {};
    if (comment.trim().length < MIN_COMMENT) {
      next.comment = `Write at least ${MIN_COMMENT} characters so the parent knows how the lesson went.`;
    }
    if (attendance === "late" && !(Number(lateMinutes) > 0)) {
      next.lateMinutes = "Enter how many minutes late the student was.";
    }
    return next;
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (found.comment) {
      document.getElementById(`${id}-comment`)?.focus();
      return;
    }
    if (found.lateMinutes) {
      document.getElementById(`${id}-late`)?.focus();
      return;
    }

    startTransition(async () => {
      const result = await sendLessonReport({
        lessonId,
        attendance,
        lateMinutes: attendance === "late" ? Number(lateMinutes) : undefined,
        comment,
        homework: homework.trim() ? { text: homework, due: due ? `${due}T12:00:00+02:00` : undefined } : undefined,
        takeaways,
        takeawaysChecked: checked,
      });
      if (result.ok) toast.success(`Report sent to ${result.recipient}`);
      else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4" aria-labelledby={`${id}-title`}>
      <div>
        <h2 id={`${id}-title`} className="text-[17px] font-bold text-foreground">
          After-class report
        </h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-foreground">Attendance</legend>
        <TileRadioGroup label="Attendance" size="compact" value={attendance} options={ATTENDANCE} onChange={setAttendance} />
        {attendance === "late" ? (
          <div className="mt-1 grid max-w-40 gap-1.5">
            <Label htmlFor={`${id}-late`}>Minutes late</Label>
            <Input
              id={`${id}-late`}
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              value={lateMinutes}
              onChange={(event) => setLateMinutes(event.target.value)}
              aria-invalid={Boolean(errors.lateMinutes)}
              aria-describedby={errors.lateMinutes ? `${id}-late-error` : undefined}
              className="h-11 rounded-[10px]"
            />
            {errors.lateMinutes ? (
              <p id={`${id}-late-error`} className="text-xs text-destructive">
                {errors.lateMinutes}
              </p>
            ) : null}
          </div>
        ) : null}
      </fieldset>

      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-comment`}>Comment for parents</Label>
        <Textarea
          id={`${id}-comment`}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          aria-invalid={Boolean(errors.comment)}
          aria-describedby={`${id}-comment-hint`}
          className="min-h-24 rounded-[10px] bg-card"
        />
        <p id={`${id}-comment-hint`} className={errors.comment ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
          {errors.comment ?? `At least ${MIN_COMMENT} characters · ${comment.trim().length} so far`}
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-homework`}>Homework</Label>
        <Input
          id={`${id}-homework`}
          value={homework}
          onChange={(event) => setHomework(event.target.value)}
          placeholder="Leave empty if there’s no homework"
          className="h-11 rounded-[10px]"
        />
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <Label htmlFor={`${id}-due`} className="text-[13px] font-normal text-muted-foreground">
            Due (optional)
          </Label>
          <Input
            id={`${id}-due`}
            type="date"
            value={due}
            onChange={(event) => setDue(event.target.value)}
            disabled={!homework.trim()}
            className="h-10 w-44 rounded-[10px]"
          />
        </div>
      </div>

      {draft.attachment ? (
        <p className="flex items-center gap-2 rounded-[10px] border border-dashed border-input px-3 py-2.5 text-[13px] text-text-secondary">
          <Paperclip aria-hidden="true" className="size-4 shrink-0 text-primary" />
          {draft.attachment} attached automatically
        </p>
      ) : null}

      <fieldset className="flex flex-col gap-2 rounded-xl bg-surface-subtle p-4">
        <legend className="sr-only">Key takeaways</legend>
        <p className="text-sm font-medium text-foreground">
          Key takeaways <span className="font-normal text-muted-foreground">· optional, recommended</span>
        </p>
        {draft.aiDrafted ? (
          <p className="text-xs text-muted-foreground">Drafted by the study helper from the lesson. Check them before you send.</p>
        ) : null}
        {takeaways.map((line, index) => (
          <Textarea
            key={index}
            aria-label={`Takeaway ${index + 1}`}
            rows={1}
            value={line}
            maxLength={140}
            onChange={(event) =>
              setTakeaways((current) => current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))
            }
            className="min-h-10 rounded-[10px] bg-card"
          />
        ))}
        {hasTakeaways ? (
          <label className="mt-1 flex items-start gap-2.5 text-[13px] text-foreground">
            <Checkbox checked={checked} onCheckedChange={(value) => setChecked(value === true)} className="mt-0.5 size-5" />
            <span>
              I’ve checked these takeaways
              <span className="block text-xs text-muted-foreground">Students only see takeaways you’ve checked.</span>
            </span>
          </label>
        ) : null}
      </fieldset>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Send report to parent"}
      </Button>
    </form>
  );
}
