import type { ReactNode } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/shared/SectionCard";
import { PageHeader } from "@/components/shell/PageHeader";

type StubLink = { href: string; label: string };

type StubPageProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  links?: StubLink[];
};

export function StubPage({
  eyebrow,
  title,
  subtitle,
  backHref,
  backLabel,
  actions,
  links,
}: StubPageProps) {
  return (
    <>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        backHref={backHref}
        backLabel={backLabel}
        actions={actions}
      />
      <SectionCard title="Coming in a later milestone">
        <p className="text-sm leading-relaxed text-text-secondary">
          This screen is a stub so the {title} route can sit in the correct role shell with the
          correct active nav item.
        </p>
        {links && links.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm font-semibold text-primary hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </SectionCard>
    </>
  );
}
