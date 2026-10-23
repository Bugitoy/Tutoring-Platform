"use client";

import { useId, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { validateLearningProfile, type LearningProfileErrors } from "@/lib/learningProfile";
import type { LearningProfile } from "@/lib/types";
import { LearningProfileFields } from "./LearningProfileFields";

type EditLearningProfileDialogProps = {
  childName: string;
  value: LearningProfile;
  onApply: (next: LearningProfile) => void;
};

export function EditLearningProfileDialog({ childName, value, onApply }: EditLearningProfileDialogProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [errors, setErrors] = useState<LearningProfileErrors>({});

  function changeOpen(next: boolean) {
    if (next) {
      setDraft(value);
      setErrors({});
    }
    setOpen(next);
  }

  function apply() {
    const found = validateLearningProfile(draft);
    setErrors(found);
    const first = found.subjects ? "subjects" : found.goals ? "goals" : null;
    if (first) {
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    onApply(draft);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>Edit learning profile</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-bold">{childName}’s learning profile</DialogTitle>
          <DialogDescription>
            Used to match {childName} with tutors and to filter past papers. Press Save changes on your profile to keep it.
          </DialogDescription>
        </DialogHeader>
        <LearningProfileFields
          key={open ? "open" : "closed"}
          idPrefix={id}
          value={draft}
          onChange={setDraft}
          errors={errors}
          subjectsLabel={`Subjects ${childName} is taking`}
          goalsLabel={`${childName}’s goals`}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={apply}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
