"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { moveLesson } from "@/lib/actions/lessons";
import { formatBookingWhen, gaboroneDate, TIMEZONE_LABEL } from "@/lib/format";
import type { BookingDay } from "@/lib/slots";

type RescheduleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
  tutorName: string;
  days: BookingDay[];
};

export function RescheduleDialog({ open, onOpenChange, lessonId, tutorName, days }: RescheduleDialogProps) {
  const router = useRouter();
  const [start, setStart] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function confirm() {
    if (!start || pending) return;
    setPending(true);
    try {
      const result = await moveLesson(lessonId, start);
      toast.success(`Lesson moved to ${formatBookingWhen(result.start)}`);
      onOpenChange(false);
      router.replace(`/student/lessons?date=${gaboroneDate(result.start)}`, { scroll: false });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not move this lesson.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setStart(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-bold">Reschedule lesson</DialogTitle>
          <DialogDescription>
            Pick a new time with {tutorName}. Times are in {TIMEZONE_LABEL}.
          </DialogDescription>
        </DialogHeader>
        <SlotPicker days={days} start={start} onStartChange={setStart} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void confirm()} disabled={!start || pending}>
            {pending ? "Moving…" : "Move lesson"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
