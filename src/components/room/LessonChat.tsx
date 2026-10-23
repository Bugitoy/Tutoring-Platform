"use client";

import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { postLessonChat } from "@/lib/actions/room";
import { CONTACT_NOTE } from "@/lib/contactSafety";
import { formatTime } from "@/lib/format";
import type { RoomRole } from "@/lib/room";
import type { LessonChatMessage } from "@/lib/types";

type LessonChatProps = {
  lessonId: string;
  role: RoomRole;
  viewerId: string;
  messages: LessonChatMessage[];
  onSent: (message: LessonChatMessage) => void;
  names: Record<string, string>;
};

export function LessonChat({ lessonId, role, viewerId, messages, onSent, names }: LessonChatProps) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const [maskedNote, setMaskedNote] = useState(false);
  const [pending, startTransition] = useTransition();
  const logRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages.length]);

  function send(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || pending) return;
    startTransition(async () => {
      const result = await postLessonChat(lessonId, role, text);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onSent(result.message);
      setMaskedNote(result.masked);
      setDraft("");
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ol ref={logRef} aria-label="Lesson chat" className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <li className="m-auto text-sm text-muted-foreground">No messages yet. Questions you type here stay with this lesson.</li>
        ) : (
          messages.map((message) => {
            const mine = message.senderId === viewerId;
            return (
              <li key={message.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                <p
                  className={cn(
                    "max-w-[90%] px-3 py-2 text-sm",
                    mine
                      ? "rounded-[14px_14px_4px_14px] bg-primary text-primary-foreground"
                      : "rounded-[14px_14px_14px_4px] bg-divider-soft text-foreground",
                  )}
                >
                  <span className="sr-only">{mine ? "You" : names[message.senderId] ?? "They"}: </span>
                  {message.text}
                </p>
                <span className="mt-0.5 text-[11px] text-muted-foreground">{formatTime(message.sentAt)}</span>
              </li>
            );
          })
        )}
      </ol>

      <form onSubmit={send} className="flex flex-col gap-1.5 border-t border-border p-3">
        {maskedNote ? <p className="text-xs text-status-warning-fg">{CONTACT_NOTE}</p> : null}
        <label htmlFor={`${id}-chat`} className="sr-only">
          Message
        </label>
        <div className="flex gap-2">
          <Input
            id={`${id}-chat`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message"
            maxLength={500}
            autoComplete="off"
            className="h-10 flex-1 rounded-[10px]"
          />
          <Button type="submit" disabled={!draft.trim() || pending} className="h-10">
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
