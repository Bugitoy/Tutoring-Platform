"use client";

import { useId, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { TileRadioGroup } from "@/components/shared/TileRadioGroup";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { PLACEHOLDERS } from "@/config/placeholders";
import { uploadResource } from "@/lib/actions/tutor";
import type { Resource } from "@/lib/types";

export type CourseOption = { curriculumId: string; name: string; subjects: { id: string; name: string }[] };

const VISIBILITY: { value: Resource["visibility"]; label: string; description: string }[] = [
  { value: "private", label: "Private", description: "Only you, for use in your lessons" },
  { value: "my_students", label: "My students", description: "Appears in your students’ Library" },
  { value: "for_sale", label: "For sale", description: "Other tutors can buy it, minus Thanodi’s fee" },
];

type Errors = Partial<Record<"file" | "title" | "price", string>>;

function titleFromFile(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

export function UploadResourceDialog({ courses }: { courses: CourseOption[] }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [curriculumId, setCurriculumId] = useState(courses[0]?.curriculumId ?? "");
  const [subjectId, setSubjectId] = useState(courses[0]?.subjects[0]?.id ?? "");
  const [visibility, setVisibility] = useState<Resource["visibility"]>("private");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();

  const course = courses.find((item) => item.curriculumId === curriculumId);
  const subjectName = course?.subjects.find((subject) => subject.id === subjectId)?.name;

  function reset() {
    setFile(null);
    setTitle("");
    setVisibility("private");
    setPrice("");
    setErrors({});
  }

  function pickCurriculum(next: string) {
    setCurriculumId(next);
    setSubjectId(courses.find((item) => item.curriculumId === next)?.subjects[0]?.id ?? "");
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found: Errors = {};
    if (!file) found.file = "Choose a PDF or image to upload.";
    if (!title.trim()) found.title = "Give the resource a title.";
    if (visibility === "for_sale" && price.trim() && !(Number(price) > 0)) found.price = "Enter a price above P0.";
    setErrors(found);
    const first = (["file", "title", "price"] as const).find((key) => found[key]);
    if (first) {
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }

    startTransition(async () => {
      const result = await uploadResource({
        title,
        fileName: file?.name ?? "",
        kind: file?.type.startsWith("image/") ? "img" : "pdf",
        curriculumId,
        subjectId: subjectId || undefined,
        visibility,
        price: visibility === "for_sale" && price.trim() ? Math.round(Number(price) * 100) : undefined,
      });
      if (result.ok) {
        toast.success(`“${title.trim()}” uploaded`);
        setOpen(false);
        reset();
      } else toast.error(result.error);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger className={buttonVariants({ size: "lg" })}>
        <Plus aria-hidden="true" />
        Upload resource
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-bold">Upload a resource</DialogTitle>
          <DialogDescription>PDFs and images up to 10 MB. You can open them in any lesson.</DialogDescription>
        </DialogHeader>

        <form id={`${id}-form`} onSubmit={submit} noValidate className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor={`${id}-file`}>File</Label>
            <input
              id={`${id}-file`}
              type="file"
              accept="application/pdf,image/*"
              onChange={(event) => {
                const picked = event.target.files?.[0] ?? null;
                setFile(picked);
                if (picked && !title.trim()) setTitle(titleFromFile(picked.name));
              }}
              aria-invalid={Boolean(errors.file)}
              aria-describedby={errors.file ? `${id}-file-error` : undefined}
              className="block w-full rounded-[10px] border border-dashed border-input p-3 text-[13px] text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:text-[13px] file:font-semibold file:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none aria-invalid:border-destructive"
            />
            {errors.file ? (
              <p id={`${id}-file-error`} className="text-xs text-destructive">
                {errors.file}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor={`${id}-title`}>Title</Label>
            <Input
              id={`${id}-title`}
              value={title}
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Quadratics: factorising worksheet"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? `${id}-title-error` : undefined}
              className="h-11 rounded-[10px]"
            />
            {errors.title ? (
              <p id={`${id}-title-error`} className="text-xs text-destructive">
                {errors.title}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <span id={`${id}-curriculum`} className="text-sm font-medium text-foreground">
                Curriculum
              </span>
              <Select value={curriculumId} onValueChange={(value) => pickCurriculum(String(value))}>
                <SelectTrigger aria-labelledby={`${id}-curriculum`} className="h-11 w-full rounded-[10px]">
                  <span className="truncate">{course?.name ?? "Choose"}</span>
                </SelectTrigger>
                <SelectContent>
                  {courses.map((item) => (
                    <SelectItem key={item.curriculumId} value={item.curriculumId}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <span id={`${id}-subject`} className="text-sm font-medium text-foreground">
                Subject
              </span>
              <Select value={subjectId} onValueChange={(value) => setSubjectId(String(value))}>
                <SelectTrigger aria-labelledby={`${id}-subject`} className="h-11 w-full rounded-[10px]">
                  <span className="truncate">{subjectName ?? "Choose"}</span>
                </SelectTrigger>
                <SelectContent>
                  {(course?.subjects ?? []).map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium text-foreground">Who can see it</legend>
            <TileRadioGroup
              label="Who can see it"
              value={visibility}
              options={VISIBILITY}
              onChange={setVisibility}
              className="sm:grid-cols-1"
            />
          </fieldset>

          {visibility === "for_sale" ? (
            <div className="grid gap-1.5">
              <Label htmlFor={`${id}-price`}>Price (optional)</Label>
              <div className="relative w-40">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-muted-foreground"
                >
                  P
                </span>
                <Input
                  id={`${id}-price`}
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step="0.5"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  aria-invalid={Boolean(errors.price)}
                  aria-describedby={`${id}-price-hint`}
                  className="h-11 rounded-[10px] pl-7"
                />
              </div>
              <p id={`${id}-price-hint`} className={errors.price ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
                {errors.price ??
                  `Leave empty to show ${PLACEHOLDERS.RESOURCE_PRICE} until you decide. Thanodi’s fee of ${PLACEHOLDERS.FEE_RATE}% comes off each sale.`}
              </p>
            </div>
          ) : null}
        </form>

        <DialogFooter>
          <Button type="submit" form={`${id}-form`} disabled={pending}>
            {pending ? "Uploading…" : "Upload resource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
