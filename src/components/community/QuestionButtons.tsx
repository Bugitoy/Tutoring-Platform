"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { followQuestion, markHelpful } from "@/lib/actions/community";
import { cn } from "cn";

type HelpfulButtonProps = {
  questionId: string;
  answerId: string;
  pressed: boolean;
  count: number;
  /** Your own answers can't be marked helpful. */
  own: boolean;
};

export function HelpfulButton({ questionId, answerId, pressed, count, own }: HelpfulButtonProps) {
  const [, startTransition] = useTransition();
  const [state, setState] = useOptimistic({ pressed, count });

  if (own) {
    return (
      <span className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-[13px] font-semibold text-muted-foreground">
        Helpful · {count}
      </span>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={state.pressed ? "default" : "outline"}
      aria-pressed={state.pressed}
      aria-label={`Helpful, ${state.count} ${state.count === 1 ? "person" : "people"}`}
      onClick={() =>
        startTransition(async () => {
          setState({ pressed: !state.pressed, count: state.count + (state.pressed ? -1 : 1) });
          const result = await markHelpful(questionId, answerId);
          if (!result.ok) toast.error(result.error);
        })
      }
      className={cn("h-9 px-3 text-[13px] font-semibold")}
    >
      Helpful · {state.count}
    </Button>
  );
}

export function FollowButton({ questionId, following }: { questionId: string; following: boolean }) {
  const [, startTransition] = useTransition();
  const [on, setOn] = useOptimistic(following);
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      aria-pressed={on}
      onClick={() =>
        startTransition(async () => {
          setOn(!on);
          const result = await followQuestion(questionId);
          if (!result.ok) toast.error(result.error);
          else toast.success(result.following ? "You’ll get a message when someone answers." : "You’ve stopped following this question.");
        })
      }
      className={cn("h-9", on && "border-primary bg-accent text-primary hover:bg-accent hover:text-primary")}
    >
      {on ? "Following" : "Follow"}
    </Button>
  );
}

// TODO(spec): moderation isn't designed yet; reporting only confirms for now.
export function ReportButton({ what }: { what: "question" | "answer" }) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="h-9"
      onClick={() => toast.success(`Thanks. A moderator will look at this ${what}.`)}
    >
      Report
    </Button>
  );
}
