"use client";

import { useId, useRef, useState, useTransition } from "react";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { shareThreadFile, sendThreadMessage } from "@/lib/actions/messages";
import { CONTACT_NOTE, findContactDetails } from "@/lib/contactSafety";
import { LessonOfferCard } from "./LessonOfferCard";
import { OfferLessonDialog, type OfferDraft } from "./OfferLessonDialog";
import type { MessagesViewer, OfferComposer } from "./types";

type ComposerProps = {
  viewer: MessagesViewer;
  threadId: string;
  offer?: OfferComposer;
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function Composer({ viewer, threadId, offer }: ComposerProps) {
  const id = useId();
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<OfferDraft | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const hasContact = findContactDetails(text).length > 0;
  const canSend = Boolean(text.trim() || draft) && !pending;

  function send(event: React.FormEvent) {
    event.preventDefault();
    if (!canSend) return;
    startTransition(async () => {
      const result = await sendThreadMessage(viewer, threadId, { text, offer: draft?.input });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setText("");
      setDraft(null);
      if (result.masked) toast.info(CONTACT_NOTE);
    });
  }

  function attach(file: File | undefined) {
    if (fileInput.current) fileInput.current.value = "";
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      toast.error("Files can be up to 10 MB.");
      return;
    }
    startTransition(async () => {
      const result = await shareThreadFile(viewer, threadId, {
        name: file.name,
        kind: file.type.startsWith("image/") ? "img" : "pdf",
        sizeKb: file.size / 1024,
      });
      if (result.ok) toast.success(`Shared ${file.name}`);
      else toast.error(result.error);
    });
  }

  return (
    <div className="border-t border-border bg-card">
      {draft ? (
        <div className="flex justify-end border-b border-border bg-surface-subtle px-4 py-3">
          <div className="w-full max-w-sm">
            <LessonOfferCard
              draft
              when={draft.when}
              priceLine={draft.priceLine}
              footer={
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="text-xs font-semibold text-primary underline underline-offset-2"
                >
                  Remove offer
                </button>
              }
            />
          </div>
        </div>
      ) : null}
      <form onSubmit={send} className="flex flex-col gap-2 p-3 sm:p-4">
        <div className="flex items-center gap-2">
          {offer ? <OfferLessonDialog {...offer} disabled={pending} onPick={setDraft} /> : null}
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf,image/*"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => attach(event.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Attach a PDF or photo"
            disabled={pending}
            onClick={() => fileInput.current?.click()}
            className="size-11 shrink-0 rounded-[10px]"
          >
            <Paperclip aria-hidden="true" />
          </Button>
          <Input
            aria-label="Message"
            placeholder="Write a message"
            value={text}
            maxLength={2000}
            onChange={(event) => setText(event.target.value)}
            aria-describedby={hasContact ? `${id}-note` : undefined}
            className="h-11 min-w-0 flex-1 rounded-[10px]"
          />
          <Button type="submit" size="lg" disabled={!canSend} className="h-11 shrink-0 px-5">
            {pending ? "Sending…" : "Send"}
          </Button>
        </div>
        {hasContact ? (
          <p id={`${id}-note`} role="status" className="text-xs text-status-warning-fg">
            {CONTACT_NOTE}
          </p>
        ) : null}
      </form>
    </div>
  );
}
