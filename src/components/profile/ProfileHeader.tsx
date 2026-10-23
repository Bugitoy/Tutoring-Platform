import type { ReactNode } from "react";
import { Avatar } from "@/components/shared/Avatar";

type ProfileHeaderProps = {
  initials: string;
  name: string;
  /** "Student · Form 4 · BGCSE · Gaborone" */
  line: string;
  actions?: ReactNode;
};

export function ProfileHeader({ initials, name, line, actions }: ProfileHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar initials={initials} size={72} />
        <div className="min-w-0">
          <h1 className="text-[28px] leading-tight font-bold text-foreground">{name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{line}</p>
        </div>
      </div>
      {actions}
    </header>
  );
}
