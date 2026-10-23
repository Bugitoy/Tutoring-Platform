import type { ReactNode } from "react";
import { cn } from "cn";

type NavyCardProps = {
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

export function NavyCard({ eyebrow, children, className }: NavyCardProps) {
  return (
    <section className={cn("rounded-2xl bg-navy p-5 text-on-navy md:p-6", className)}>
      {eyebrow ? (
        <p className="mb-2 text-xs font-bold tracking-[0.07em] text-brand-sky uppercase">{eyebrow}</p>
      ) : null}
      {children}
    </section>
  );
}
