import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { studentAccount } from "@/lib/account";
import { getDemoSession } from "@/lib/data/profiles";
import { canBook } from "@/lib/permissions";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const { student } = await getDemoSession();

  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <AppShell
        role="student"
        account={studentAccount(student)}
        hideFindTutors={!canBook(student)}
      >
        {children}
      </AppShell>
    </Suspense>
  );
}
