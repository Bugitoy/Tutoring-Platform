import type { ReactNode } from "react";
import { cn } from "cn";

type MessageBubbleProps = {
  mine: boolean;
  meta: string;
  /** Text bubbles get the coloured bubble; attachments and offers bring their own card. */
  plain?: boolean;
  children: ReactNode;
};

export function MessageBubble({ mine, meta, plain = false, children }: MessageBubbleProps) {
  return (
    <div className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] text-sm leading-relaxed break-words whitespace-pre-line sm:max-w-[70%]",
          !plain &&
            (mine
              ? "rounded-[14px_14px_4px_14px] bg-primary px-3.5 py-2.5 text-primary-foreground"
              : "rounded-[14px_14px_14px_4px] border border-border bg-card px-3.5 py-2.5 text-foreground"),
        )}
      >
        {children}
      </div>
      <p className="text-[11px] text-muted-foreground">{meta}</p>
    </div>
  );
}
