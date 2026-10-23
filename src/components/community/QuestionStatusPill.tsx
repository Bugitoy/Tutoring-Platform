import { StatusPill, type StatusTone } from "@/components/shared/StatusPill";
import type { Question } from "@/lib/types";

const STATUS: Record<Question["status"], { label: string; tone: StatusTone }> = {
  verified: { label: "Verified", tone: "success" },
  answered: { label: "Answered", tone: "info" },
  unanswered: { label: "Unanswered", tone: "warning" },
};

export function QuestionStatusPill({ status }: { status: Question["status"] }) {
  const view = STATUS[status];
  return (
    <StatusPill tone={view.tone} className="rounded-[6px] px-2 py-1">
      {view.label}
    </StatusPill>
  );
}
