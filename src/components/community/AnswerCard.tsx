import { Check } from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import { StatusPill } from "@/components/shared/StatusPill";
import { cn } from "cn";
import { HelpfulButton } from "./QuestionButtons";
import { AnswerBody } from "./RichText";

export type AnswerView = {
  id: string;
  questionId: string;
  authorName: string;
  authorInitials: string;
  /** "Student helper · Level 5" */
  authorLabel: string;
  /** "1 hour ago" */
  ago: string;
  body: string;
  imageName?: string;
  helpful: { pressed: boolean; count: number; own: boolean };
  /** "Ms. Kagiso Molefe" */
  verifiedBy?: string;
  pointsEarned?: number;
};

export function AnswerCard({ answer }: { answer: AnswerView }) {
  const verified = Boolean(answer.verifiedBy);
  return (
    <article
      aria-label={verified ? `Verified answer by ${answer.authorName}` : `Answer by ${answer.authorName}`}
      className={cn(
        "rounded-xl bg-card p-5",
        verified ? "border-2 border-status-success-fg" : "border border-border",
      )}
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {verified ? <Avatar initials={answer.authorInitials} size={44} /> : null}
          <div>
            <p className="text-sm text-muted-foreground">
              <span className="text-[15px] font-bold text-foreground">{answer.authorName}</span> · {answer.authorLabel}
              {verified ? null : <> · {answer.ago}</>}
            </p>
            {verified ? <p className="text-xs text-muted-foreground">{answer.ago}</p> : null}
          </div>
        </div>
        {answer.verifiedBy ? (
          <StatusPill tone="success">
            <Check className="size-3.5" aria-hidden="true" />
            Verified by {answer.verifiedBy}, tutor
          </StatusPill>
        ) : null}
      </header>
      <AnswerBody body={answer.body} />
      {answer.imageName ? (
        <p className="mt-3 inline-flex rounded-lg bg-divider-soft px-3 py-1.5 text-xs text-text-secondary">
          Photo: {answer.imageName}
        </p>
      ) : null}
      <footer className="mt-4 flex flex-wrap items-center gap-2">
        <HelpfulButton
          questionId={answer.questionId}
          answerId={answer.id}
          pressed={answer.helpful.pressed}
          count={answer.helpful.count}
          own={answer.helpful.own}
        />
        {answer.pointsEarned ? (
          <StatusPill tone="warning" className="h-9 rounded-lg px-3">
            +{answer.pointsEarned} points earned
          </StatusPill>
        ) : null}
      </footer>
    </article>
  );
}
