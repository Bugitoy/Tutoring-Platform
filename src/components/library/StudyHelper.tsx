"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

type Turn = { from: "me" | "helper"; text: string };

type StudyHelperProps = {
  workingOn: string;
  /** "Ms. Kagiso Molefe" — who a flag goes to. */
  tutorName?: string;
};

const OPENING: Turn[] = [
  { from: "me", text: "Why does the answer use x = −2 and not x = 2?" },
  {
    from: "helper",
    text: "The factors are (x + 2)(x − 4). For the first bracket to equal zero, x has to be −2. Try plugging −2 back in to check. What do you get?",
  },
];

// TODO(spec): the real helper model isn't chosen; v1 answers from a few canned replies (section 7.6).
const REPLIES: { match: RegExp; text: string }[] = [
  {
    match: /factor|bracket/i,
    text: "Look for two numbers that multiply to the last term and add to the middle one. Write them into two brackets, then expand to check you get back where you started.",
  },
  {
    match: /graph|curve|turning|vertex/i,
    text: "Start with where the curve crosses the x-axis: those are the solutions. The turning point sits halfway between them. Which x-value is halfway here?",
  },
  {
    match: /simultaneous|two equations/i,
    text: "Try making one letter the subject of the easier equation, then substitute it into the other. Which equation looks easier to rearrange?",
  },
  {
    match: /formula|quadratic formula/i,
    text: "Write down a, b and c first, including their signs. Then work out b² − 4ac on its own before putting it under the square root. What do you get for b² − 4ac?",
  },
];

const FALLBACK =
  "Let’s take it one step at a time. Write down the first line of your working and tell me where it stops making sense. I’ll explain that step rather than give the answer.";

function replyTo(question: string) {
  return REPLIES.find((reply) => reply.match.test(question))?.text ?? FALLBACK;
}

export function StudyHelper({ workingOn, tutorName }: StudyHelperProps) {
  const id = useId();
  const router = useRouter();
  const [turns, setTurns] = useState<Turn[]>(OPENING);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const logRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [turns, thinking]);

  const lastQuestion = [...turns].reverse().find((turn) => turn.from === "me")?.text ?? "";

  function ask(event: FormEvent) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || thinking) return;
    setTurns((current) => [...current, { from: "me", text: question }]);
    setDraft("");
    setThinking(true);
    window.setTimeout(() => {
      setTurns((current) => [...current, { from: "helper", text: replyTo(question) }]);
      setThinking(false);
    }, 700);
  }

  // TODO(spec): where flags show up for the tutor isn't designed; v1 confirms with a toast only.
  function flag() {
    toast.success(`Flagged for ${tutorName ?? "your tutor"} to check in your next lesson`);
  }

  return (
    <section aria-labelledby={`${id}-title`} className="rounded-xl border border-border bg-card p-4">
      <header className="mb-3 flex items-center gap-3">
        <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-lg bg-navy text-on-navy">
          <Sparkles className="size-4" />
        </span>
        <div>
          <h2 id={`${id}-title`} className="text-[15px] font-bold text-foreground">
            Study helper
          </h2>
          <p className="text-xs text-muted-foreground">Working on: {workingOn}</p>
        </div>
      </header>

      <ol ref={logRef} aria-live="polite" className="mb-3 flex max-h-80 flex-col gap-2.5 overflow-y-auto">
        {turns.map((turn, index) => (
          <li key={index} className={cn("flex", turn.from === "me" ? "justify-end" : "justify-start")}>
            <p
              className={cn(
                "max-w-[90%] px-3 py-2 text-sm",
                turn.from === "me"
                  ? "rounded-[14px_14px_4px_14px] bg-primary text-primary-foreground"
                  : "rounded-[14px_14px_14px_4px] bg-divider-soft text-foreground",
              )}
            >
              <span className="sr-only">{turn.from === "me" ? "You: " : "Study helper (AI): "}</span>
              {turn.text}
            </p>
          </li>
        ))}
        {thinking ? (
          <li className="flex justify-start">
            <p className="rounded-[14px_14px_14px_4px] bg-divider-soft px-3 py-2 text-sm text-muted-foreground">
              Thinking…
            </p>
          </li>
        ) : null}
      </ol>

      <p className="mb-3 rounded-lg bg-status-warning-bg px-3 py-2.5 text-xs text-status-warning-fg">
        The helper can make mistakes. It explains steps rather than giving answers, and you can flag anything for
        your tutor to check in your next lesson.
      </p>

      <form onSubmit={ask} className="mb-3 flex flex-col gap-1.5">
        <label htmlFor={`${id}-ask`} className="text-[13px] font-semibold text-foreground">
          Ask a question
        </label>
        <div className="flex gap-2">
          <Input
            id={`${id}-ask`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type your question"
            className="h-10 flex-1 rounded-[10px]"
          />
          <Button type="submit" disabled={!draft.trim() || thinking} className="h-10">
            Ask
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={flag}
        >
          Flag for my tutor
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push(`/student/community?ask=${encodeURIComponent(lastQuestion)}`)}
        >
          Ask the community
        </Button>
      </div>
    </section>
  );
}
