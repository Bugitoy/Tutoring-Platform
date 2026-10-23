"use client";

import { useId, useRef, useState, useTransition, type FormEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { postCommunityAnswer } from "@/lib/actions/community";
import { validateAnswer } from "@/lib/community";

const MAX_IMAGE_MB = 10;

export function AnswerForm({ questionId }: { questionId: string }) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState("");
  const [imageName, setImageName] = useState<string>();
  const [tried, setTried] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const error = serverError ?? (tried ? validateAnswer(body) : null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTried(true);
    setServerError(null);
    if (validateAnswer(body)) {
      textRef.current?.focus();
      return;
    }
    startTransition(async () => {
      const result = await postCommunityAnswer(questionId, { body, imageName });
      if (!result.ok) {
        setServerError(result.error);
        textRef.current?.focus();
        return;
      }
      setBody("");
      setImageName(undefined);
      setTried(false);
      toast.success("Answer posted. You’ll earn points when people find it helpful.");
    });
  }

  return (
    <form onSubmit={submit} noValidate aria-labelledby={`${id}-title`} className="rounded-xl border border-border bg-card p-5">
      <h2 id={`${id}-title`} className="mb-2 text-[15px] font-bold text-foreground">
        <label htmlFor={`${id}-body`}>Your answer</label>
      </h2>
      <Textarea
        ref={textRef}
        id={`${id}-body`}
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
          setServerError(null);
        }}
        rows={4}
        placeholder="Explain the steps so others can learn from it"
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
        className="rounded-[10px]"
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
      {imageName ? (
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-divider-soft py-1 pr-1 pl-3 text-xs text-text-secondary">
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
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          Answers need a short explanation. No contact details.
        </p>
        <div className="flex gap-2">
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
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} className="h-10">
            <ImagePlus aria-hidden="true" />
            Add photo
          </Button>
          <Button type="submit" disabled={pending} className="h-10">
            {pending ? "Posting…" : "Post answer"}
          </Button>
        </div>
      </div>
    </form>
  );
}
