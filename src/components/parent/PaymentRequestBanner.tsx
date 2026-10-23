"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { declineRequest } from "@/lib/actions/booking";

type PaymentRequestBannerProps = {
  requestId: string;
  childName: string;
  /** "Physics with Thato Sebego · Sun 1 Nov, 10:00 · P90" */
  summary: string;
  note: string;
  reviewHref: string;
};

export function PaymentRequestBanner({ requestId, childName, summary, note, reviewHref }: PaymentRequestBannerProps) {
  const router = useRouter();
  const messageId = useId();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function decline() {
    if (pending) return;
    setPending(true);
    try {
      await declineRequest(requestId, message);
      toast.success("Request declined");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not decline this request.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border-2 border-highlight-border bg-card p-5 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-bold tracking-[0.07em] text-status-warning-fg uppercase">
          Payment request from {childName}
        </p>
        <h2 className="mt-1 text-[15px] font-bold text-foreground">{summary}</h2>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{note}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link href={reviewHref} className={buttonVariants()}>
          Review and pay
        </Link>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Decline
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[17px] font-bold">Decline {childName}’s request?</DialogTitle>
            <DialogDescription>
              The lesson is cancelled and the held time is released. {summary}.
            </DialogDescription>
          </DialogHeader>
          <label htmlFor={messageId} className="text-sm font-medium text-foreground">
            Message to {childName} (optional)
          </label>
          <Textarea
            id={messageId}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="-mt-4 min-h-20 bg-card"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Keep request
            </Button>
            <Button variant="destructive" onClick={() => void decline()} disabled={pending}>
              {pending ? "Declining…" : "Decline request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
