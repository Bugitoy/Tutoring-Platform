import Link from "next/link";
import { StatusPill } from "@/components/shared/StatusPill";
import { SafetyNote } from "./SafetyNote";
import type { ContextCard } from "./types";

type ConversationContextProps = {
  context?: ContextCard;
  safety: { lead: string; text: string };
};

export function ConversationContext({ context, safety }: ConversationContextProps) {
  return (
    <div className="flex flex-col gap-3">
      {context ? (
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-2 text-[15px] font-bold text-foreground">{context.title}</h2>
          <ul className="flex flex-col gap-1.5 text-[13px] text-text-secondary">
            {context.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {context.pill ? (
            <StatusPill tone={context.pill.tone} className="mt-2">
              {context.pill.label}
            </StatusPill>
          ) : null}
          {context.link ? (
            <Link
              href={context.link.href}
              className="mt-3 inline-flex text-[13px] font-semibold text-primary underline underline-offset-2"
            >
              {context.link.label}
            </Link>
          ) : null}
        </section>
      ) : null}
      <SafetyNote lead={safety.lead} text={safety.text} />
    </div>
  );
}
