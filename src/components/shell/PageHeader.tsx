"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePageTitle } from "@/components/shell/PageTitleContext";

type PageHeaderProps = {
  eyebrow?: string;
  /** "plain" shows the eyebrow in sentence case, e.g. "Term 3 · week 7". */
  eyebrowStyle?: "caps" | "plain";
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
};

export function PageHeader({
  eyebrow,
  eyebrowStyle = "caps",
  title,
  subtitle,
  backHref,
  backLabel,
  actions,
}: PageHeaderProps) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(title);
    return () => setTitle(null);
  }, [setTitle, title]);

  return (
    <header className="mb-6">
      {backHref && backLabel ? (
        <Link href={backHref} className="mb-3 inline-flex text-sm font-semibold text-primary hover:underline">
          ← {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p
              className={
                eyebrowStyle === "caps"
                  ? "mb-1 text-xs font-bold tracking-[0.07em] text-muted-foreground uppercase"
                  : "mb-1 text-[13px] text-muted-foreground"
              }
            >
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-[28px] leading-tight font-bold text-foreground">{title}</h1>
          {subtitle ? <p className="mt-1 text-[15px] text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
