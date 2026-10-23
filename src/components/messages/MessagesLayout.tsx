"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { cn } from "cn";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChatThread } from "./ChatThread";
import { ConversationContext } from "./ConversationContext";
import { ThreadList } from "./ThreadList";
import type { ConversationView, MessagesViewer, ThreadSummary } from "./types";

type MessagesLayoutProps = {
  viewer: MessagesViewer;
  threads: ThreadSummary[];
  conversation?: ConversationView;
  /** True when the URL names a thread: phones then show the conversation instead of the list. */
  threadOpen: boolean;
  basePath: string;
  searchPlaceholder: string;
};

const PANEL = "min-h-0 overflow-hidden rounded-xl border border-border bg-card";

export function MessagesLayout({ viewer, threads, conversation, threadOpen, basePath, searchPlaceholder }: MessagesLayoutProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="-mx-4 -my-4 flex h-[calc(100dvh-8.5rem)] min-h-[420px] gap-4 sm:h-[calc(100dvh-4.5rem)] lg:mx-0 lg:my-0 lg:h-[calc(100dvh-4rem)] lg:min-h-[520px]">
      <div
        className={cn(
          PANEL,
          "w-full rounded-none border-0 lg:flex lg:w-auto lg:min-w-[250px] lg:flex-[1_1_0] lg:rounded-xl lg:border",
          threadOpen ? "hidden" : "flex flex-col",
        )}
      >
        <ThreadList threads={threads} selectedId={conversation?.threadId} searchPlaceholder={searchPlaceholder} />
      </div>

      <div
        className={cn(
          PANEL,
          "min-w-0 flex-[3_1_0] flex-col rounded-none border-0 lg:flex lg:rounded-xl lg:border",
          threadOpen ? "flex" : "hidden",
        )}
      >
        {conversation ? (
          <ChatThread
            viewer={viewer}
            conversation={conversation}
            backHref={basePath}
            infoButton={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={conversation.context?.title ?? "About this conversation"}
                onClick={() => setInfoOpen(true)}
                className="shrink-0 xl:hidden"
              >
                <Info aria-hidden="true" />
              </Button>
            }
          />
        ) : (
          <div className="p-6">
            <EmptyState title="No conversations yet" description="Messages with tutors and Thanodi support appear here." />
          </div>
        )}
      </div>

      {conversation ? (
        <aside aria-label="About this conversation" className="hidden min-w-[230px] flex-[1_1_0] overflow-y-auto xl:block">
          <ConversationContext context={conversation.context} safety={conversation.safety} />
        </aside>
      ) : null}

      {conversation ? (
        <Sheet open={infoOpen} onOpenChange={setInfoOpen}>
          <SheetContent side="right" className="w-[320px] gap-0 bg-background sm:max-w-[320px]">
            <SheetHeader>
              <SheetTitle>{conversation.name}</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6">
              <ConversationContext context={conversation.context} safety={conversation.safety} />
            </div>
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  );
}
