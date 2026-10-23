"use client";

import { useId, useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { askCommunityQuestion } from "@/lib/actions/community";
import { similarQuestions, validateQuestion, type QuestionErrors } from "@/lib/community";
import { CURRICULA, getCurriculum } from "@/lib/curricula";

export type SimilarCandidate = { id: string; title: string; curriculumId: string; subjectId: string };

type AskQuestionDialogProps = {
  defaultCurriculumId: string;
  defaultSubjectId: string;
  pool: SimilarCandidate[];
  /** Pre-filled from the Library's "Ask the community", which also opens the dialog. */
  initialTitle?: string;
};

const MAX_IMAGE_MB = 10;

export function AskQuestionDialog({ defaultCurriculumId, defaultSubjectId, pool, initialTitle }: AskQuestionDialogProps) {
  const id = useId();
  const router = useRouter();
  const pathname = usePathname();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(Boolean(initialTitle));
  const [title, setTitle] = useState(initialTitle ?? "");
  const [body, setBody] = useState("");
  const [curriculumId, setCurriculumId] = useState(defaultCurriculumId);
  const [subjectId, setSubjectId] = useState(defaultSubjectId);
  const [imageName, setImageName] = useState<string>();
  const [errors, setErrors] = useState<QuestionErrors>({});
  const [pending, startTransition] = useTransition();

  const curriculum = getCurriculum(curriculumId);
  const subjects = curriculum?.subjects ?? [];
  const subjectName = subjects.find((subject) => subject.id === subjectId)?.name;
  const similar = similarQuestions(title, { curriculumId, subjectId }, pool);

  function changeOpen(next: boolean) {
    setOpen(next);
    if (!next && initialTitle) router.replace(pathname, { scroll: false });
  }

  function chooseCurriculum(next: string) {
    setCurriculumId(next);
    const nextSubjects = getCurriculum(next)?.subjects ?? [];
    if (!nextSubjects.some((subject) => subject.id === subjectId)) setSubjectId("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateQuestion({ title, body, subjectId });
    setErrors(found);
    if (found.title || found.body || found.subject) {
      const firstField = found.title ? "title" : found.body ? "body" : "subject";
      document.getElementById(`${id}-${firstField}`)?.focus();
      return;
    }
    startTransition(async () => {
      const result = await askCommunityQuestion({ title, body, curriculumId, subjectId, imageName });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Question posted. You’ll get a message when someone answers.");
      setOpen(false);
      router.push(`/student/community/${result.questionId}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger className={buttonVariants({ className: "h-11 px-4" })}>+ Ask a question</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-bold">Ask a question</DialogTitle>
          <DialogDescription>Explain what you tried. Helpers answer with steps, not just the answer.</DialogDescription>
        </DialogHeader>
        <form id={`${id}-form`} onSubmit={submit} noValidate className="grid gap-4">
          <div className="grid gap-1.5">
            <label htmlFor={`${id}-title`} className="text-[13px] font-semibold text-foreground">
              Your question
            </label>
            <Input
              id={`${id}-title`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Why does 2023 Paper 1 Q5 use x = −2?"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? `${id}-title-error` : undefined}
              className="h-11 rounded-[10px]"
            />
            {errors.title ? (
              <p id={`${id}-title-error`} className="text-[13px] text-destructive">
                {errors.title}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <label htmlFor={`${id}-body`} className="text-[13px] font-semibold text-foreground">
              Details <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id={`${id}-body`}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="What did you try? Where did you get stuck?"
              rows={4}
              aria-invalid={Boolean(errors.body)}
              aria-describedby={errors.body ? `${id}-body-error` : undefined}
              className="rounded-[10px]"
            />
            {errors.body ? (
              <p id={`${id}-body-error`} className="text-[13px] text-destructive">
                {errors.body}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
                  toast.error(`Photos can be up to ${MAX_IMAGE_MB} MB.`);
                  return;
                }
                setImageName(file.name);
              }}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <ImagePlus aria-hidden="true" />
              Add photo
            </Button>
            {imageName ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-divider-soft py-1 pr-1 pl-3 text-xs text-text-secondary">
                {imageName}
                <button
                  type="button"
                  aria-label={`Remove ${imageName}`}
                  onClick={() => setImageName(undefined)}
                  className="rounded-full p-1 hover:bg-border"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </span>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <span id={`${id}-curriculum-label`} className="text-[13px] font-semibold text-foreground">
                Curriculum
              </span>
              <Select value={curriculumId} onValueChange={(value) => chooseCurriculum(String(value))}>
                <SelectTrigger aria-labelledby={`${id}-curriculum-label`} className="h-11 w-full rounded-[10px]">
                  <span className="truncate">{curriculum?.name ?? "Choose"}</span>
                </SelectTrigger>
                <SelectContent>
                  {CURRICULA.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <span id={`${id}-subject-label`} className="text-[13px] font-semibold text-foreground">
                Subject
              </span>
              <Select value={subjectId} onValueChange={(value) => setSubjectId(String(value))}>
                <SelectTrigger
                  id={`${id}-subject`}
                  aria-labelledby={`${id}-subject-label`}
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={errors.subject ? `${id}-subject-error` : undefined}
                  className="h-11 w-full rounded-[10px]"
                >
                  <span className="truncate">{subjectName ?? "Choose a subject"}</span>
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subject ? (
                <p id={`${id}-subject-error`} className="text-[13px] text-destructive">
                  {errors.subject}
                </p>
              ) : null}
            </div>
          </div>

          {similar.length > 0 ? (
            <section aria-labelledby={`${id}-similar`} className="rounded-xl bg-accent p-4">
              <h3 id={`${id}-similar`} className="mb-2 text-sm font-bold text-foreground">
                Similar questions
              </h3>
              <p className="mb-2 text-[13px] text-text-secondary">One of these might already have your answer.</p>
              <ul className="flex flex-col gap-1.5">
                {similar.map((question) => (
                  <li key={question.id}>
                    <Link
                      href={`/student/community/${question.id}`}
                      onClick={() => setOpen(false)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {question.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => changeOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form={`${id}-form`} disabled={pending}>
            {pending ? "Posting…" : "Post question"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
