import Link from "next/link";
import { Tag } from "@/components/shared/Tag";
import type { Question } from "@/lib/types";
import { QuestionStatusPill } from "./QuestionStatusPill";

export type FeedQuestion = {
  id: string;
  title: string;
  status: Question["status"];
  answerCount: number;
  /** "BGCSE Maths" */
  course: string;
  topic?: string;
  /** "Neo S. · 2 h ago" */
  byline: string;
  curriculumId: string;
  subjectId: string;
  isMine: boolean;
  isPastPaper: boolean;
};

export function QuestionCard({ question }: { question: FeedQuestion }) {
  return (
    <Link
      href={`/student/community/${question.id}`}
      className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-surface-subtle py-2">
        <span className="text-lg leading-none font-bold text-foreground">{question.answerCount}</span>
        <span className="mt-1 text-[10px] text-muted-foreground">{question.answerCount === 1 ? "answer" : "answers"}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-foreground">{question.title}</span>
        <span className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <QuestionStatusPill status={question.status} />
          <Tag>{question.course}</Tag>
          {question.topic ? <Tag>{question.topic}</Tag> : null}
          <span>· {question.byline}</span>
        </span>
      </span>
    </Link>
  );
}
