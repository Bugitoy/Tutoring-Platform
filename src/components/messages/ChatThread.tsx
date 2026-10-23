"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { AttachmentBubble } from "./AttachmentBubble";
import { Composer } from "./Composer";
import { LessonOfferCard } from "./LessonOfferCard";
import { MessageBubble } from "./MessageBubble";
import type { ConversationView, MessagesViewer } from "./types";

type ChatThreadProps = {
  viewer: MessagesViewer;
  conversation: ConversationView;
  backHref: string;
  /** The ⓘ button that opens the context sheet below the widest breakpoint. */
  infoButton?: ReactNode;
};

export function ChatThread({ viewer, conversation, backHref, infoButton }: ChatThreadProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const lastId = conversation.items.at(-1)?.id;

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [conversation.threadId, lastId]);

  return (
    <section aria-label={`Conversation with ${conversation.name}`} className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-border px-3 py-3 sm:px-4">
        <Link
          href={backHref}
          scroll={false}
          aria-label="Back to all messages"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "shrink-0 lg:hidden")}
        >
          <ArrowLeft aria-hidden="true" />
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15px] font-bold text-foreground">{conversation.name}</h2>
          {conversation.roleLine ? (
            <p className="truncate text-xs text-muted-foreground">{conversation.roleLine}</p>
          ) : null}
        </div>
        {conversation.action ? (
          <Link
            href={conversation.action.href}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden shrink-0 sm:inline-flex")}
          >
            {conversation.action.label}
          </Link>
        ) : null}
        {infoButton}
      </header>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto bg-surface-subtle px-3 py-4 sm:px-5">
        {conversation.items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No messages yet. Say hello.</p>
        ) : (
          <ol className="flex flex-col gap-3" aria-live="polite">
            {conversation.items.map((item) =>
              item.type === "day" ? (
                <li key={item.id} className="py-1 text-center text-xs font-medium text-muted-foreground">
                  {item.label}
                </li>
              ) : (
                <li key={item.id}>
                  <MessageBubble mine={item.mine} meta={item.meta} plain={!item.text}>
                    {item.text ?? null}
                    {item.file ? <AttachmentBubble {...item.file} /> : null}
                    {item.offer ? <LessonOfferCard {...item.offer} /> : null}
                  </MessageBubble>
                </li>
              ),
            )}
          </ol>
        )}
      </div>

      {conversation.action ? (
        <div className="border-t border-border bg-card px-3 pt-3 sm:hidden">
          <Link href={conversation.action.href} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}>
            {conversation.action.label}
          </Link>
        </div>
      ) : null}
      <Composer key={conversation.threadId} viewer={viewer} threadId={conversation.threadId} offer={conversation.offer} />
    </section>
  );
}
