import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { parentAccount } from "@/lib/account";
import { getChildrenForParent, getDemoSession } from "@/lib/data/profiles";

export default async function ParentLayout({ children }: { children: ReactNode }) {
  const { parent } = await getDemoSession();
  const childrenOfParent = await getChildrenForParent(parent.id);

  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <AppShell role="parent" account={parentAccount(parent, childrenOfParent)}>
        {children}
      </AppShell>
    </Suspense>
  );
}
