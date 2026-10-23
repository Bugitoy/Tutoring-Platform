type AttachmentBubbleProps = {
  name: string;
  kind: "pdf" | "img";
  /** "Added to your Library · 210 KB" */
  note: string;
};

export function AttachmentBubble({ name, kind, note }: AttachmentBubbleProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 pr-4">
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-[11px] font-bold text-primary uppercase"
      >
        {kind === "pdf" ? "PDF" : "IMG"}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-foreground">
          {name}
          <span className="sr-only">, {kind === "pdf" ? "PDF" : "image"}</span>
        </span>
        <span className="block text-xs text-muted-foreground">{note}</span>
      </span>
    </div>
  );
}
