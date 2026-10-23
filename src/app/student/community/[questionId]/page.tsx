import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnswerCard, type AnswerView } from "@/components/community/AnswerCard";
import { AnswerForm } from "@/components/community/AnswerForm";
import { FollowButton, ReportButton } from "@/components/community/QuestionButtons";
import { QuestionStatusPill } from "@/components/community/QuestionStatusPill";
import { WorkingBox } from "@/components/community/RichText";
import { NavyCard } from "@/components/shared/NavyCard";
import { NoticeBox } from "@/components/shared/NoticeBox";
import { Tag } from "@/components/shared/Tag";
import { buttonVariants } from "@/components/ui/button";
import { getCurriculum } from "@/lib/curricula";
import {
  getAnswers,
  getMember,
  getQuestion,
  getRelatedQuestions,
  pointsEarned,
} from "@/lib/data/community";
import { getDemoSession } from "@/lib/data/profiles";
import { listTutors } from "@/lib/data/tutors";
import { formatAgo } from "@/lib/format";
import { courseLabel, subjectShort } from "@/lib/lessonStatus";
import { MOCK_NOW_ISO } from "@/lib/mock/ids";
import { defaultExtras, searchQuery } from "@/lib/tutorSearch";

type Params = Promise<{ questionId: string }>;

async function StudentQuestion({ params }: { params: Params }) {
  const { questionId } = await params;
  const [question, { student }] = await Promise.all([getQuestion(questionId), getDemoSession()]);
  if (!question) notFound();

  const [answers, related, tutors] = await Promise.all([
    getAnswers(question.id),
    getRelatedQuestions(question),
    listTutors(),
  ]);
  const curriculum = getCurriculum(question.curriculumId);
  const author = getMember(question.authorId);
  const subject = subjectShort(question.curriculumId, question.subjectId);
  const topic = question.topic ?? subject;

  const tutorsForSubject = tutors.filter((tutor) =>
    tutor.offerings.some(
      (offering) =>
        offering.curriculumId === question.curriculumId &&
        (offering.entireCurriculum || offering.subjectId === question.subjectId),
    ),
  ).length;
  const tutorsHref = curriculum
    ? `/student/tutors?${searchQuery(
        {
          level: curriculum.level,
          system: curriculum.system,
          curriculumId: curriculum.id,
          subjectId: question.subjectId,
          child: "other",
          ...defaultExtras(),
        },
        "student",
      )}`
    : "/student/tutors";

  const views: AnswerView[] = answers.map((answer) => {
    const member = getMember(answer.authorId);
    const verifier = answer.verifiedByTutorId ? tutors.find((tutor) => tutor.id === answer.verifiedByTutorId) : undefined;
    return {
      id: answer.id,
      questionId: question.id,
      authorName: member.name,
      authorInitials: member.initials,
      authorLabel: member.label,
      ago: formatAgo(answer.createdAt, MOCK_NOW_ISO, "long"),
      body: answer.body,
      imageName: answer.imageName,
      helpful: {
        pressed: Boolean(answer.helpfulBy?.includes(student.id)),
        count: answer.helpfulCount,
        own: answer.authorId === student.id,
      },
      verifiedBy: answer.verifiedByTutorId ? (verifier?.fullName ?? "a tutor") : undefined,
      pointsEarned: pointsEarned(answer, question) || undefined,
    };
  });

  return (
    <>
      <Link href="/student/community" className="mb-4 inline-flex text-sm font-semibold text-primary hover:underline">
        ← Back to community
      </Link>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-4">
          <article className="rounded-xl border border-border bg-card p-5 md:p-6">
            <div className="mb-3 flex flex-wrap gap-1.5">
              <QuestionStatusPill status={question.status} />
              <Tag>{courseLabel(question.curriculumId, question.subjectId)}</Tag>
              {question.topic ? <Tag>{question.topic}</Tag> : null}
              {question.pastPaperRef ? <Tag>{question.pastPaperRef}</Tag> : null}
            </div>
            <h1 className="mb-3 text-2xl leading-snug font-bold text-foreground">{question.title}</h1>
            {question.body ? <p className="mb-4 text-[15px] leading-relaxed text-text-secondary">{question.body}</p> : null}
            {question.working?.length ? <WorkingBox lines={question.working} /> : null}
            <footer className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-muted-foreground">
                Asked by {author.name} · {formatAgo(question.createdAt, MOCK_NOW_ISO, "long")}
              </p>
              <div className="flex gap-2">
                <FollowButton questionId={question.id} following={Boolean(question.followerIds?.includes(student.id))} />
                <ReportButton what="question" />
              </div>
            </footer>
          </article>

          <h2 className="mt-2 text-lg font-bold text-foreground">
            {views.length === 0 ? "No answers yet" : `${views.length} ${views.length === 1 ? "answer" : "answers"}`}
          </h2>
          {views.length === 0 ? (
            <p className="text-sm text-muted-foreground">Be the first to explain the steps.</p>
          ) : (
            views.map((answer) => <AnswerCard key={answer.id} answer={answer} />)
          )}

          <AnswerForm questionId={question.id} />
        </div>

        <aside className="flex flex-col gap-4">
          <NavyCard eyebrow={`Still stuck on ${topic}?`}>
            <p className="text-[15px] font-bold text-on-navy">Book a 1:1 video lesson on this topic</p>
            <p className="mt-1 text-[13px] text-on-navy-faint">
              {/* TODO(spec): "available this week" needs live availability; v1 counts every tutor for the subject. */}
              {tutorsForSubject} {subject} {tutorsForSubject === 1 ? "tutor" : "tutors"} available this week
            </p>
            <Link
              href={tutorsHref}
              className={buttonVariants({
                className: "mt-4 bg-brand-sky text-brand-sky-foreground hover:bg-brand-sky/90",
              })}
            >
              Find a tutor
            </Link>
          </NavyCard>

          {related.length > 0 ? (
            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 text-[15px] font-bold text-foreground">Similar questions</h2>
              <ul className="flex flex-col gap-2.5">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link href={`/student/community/${item.id}`} className="text-sm text-primary hover:underline">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <NoticeBox tone="warning">
            AI hints are labelled and never count as verified. Only a tutor can verify an answer.
          </NoticeBox>
        </aside>
      </div>
    </>
  );
}

export default function StudentQuestionPage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
          <div className="h-6 w-40 rounded bg-divider-soft" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="h-[28rem] rounded-xl bg-divider-soft" />
            <div className="h-72 rounded-xl bg-divider-soft" />
          </div>
        </div>
      }
    >
      <StudentQuestion params={params} />
    </Suspense>
  );
}
