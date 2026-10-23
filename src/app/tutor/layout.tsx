import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { tutorAccount } from "@/lib/account";
import { getDemoSession } from "@/lib/data/profiles";

export default async function TutorLayout({ children }: { children: ReactNode }) {
  const { tutor } = await getDemoSession();

  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <AppShell role="tutor" account={tutorAccount(tutor)}>
        {children}
      </AppShell>
    </Suspense>
  );
}
