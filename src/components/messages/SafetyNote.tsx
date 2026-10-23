type SafetyNoteProps = {
  lead: string;
  text: string;
};

export function SafetyNote({ lead, text }: SafetyNoteProps) {
  return (
    <p className="rounded-xl bg-accent p-4 text-[13px] leading-relaxed text-text-secondary">
      <strong className="font-bold text-foreground">{lead}</strong> {text}
    </p>
  );
}
