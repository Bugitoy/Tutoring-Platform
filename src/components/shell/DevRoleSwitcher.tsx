"use client";

import Link from "next/link";
import { cn } from "cn";
import { ROLE_HOME, type Role } from "@/config/nav";

const ROLES: { role: Role; label: string }[] = [
  { role: "student", label: "Student" },
  { role: "parent", label: "Parent" },
  { role: "tutor", label: "Tutor" },
];

export function DevRoleSwitcher({ role }: { role: Role }) {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed right-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 rounded-full border border-border bg-card p-1 shadow-none lg:bottom-4">
      <p className="sr-only">Development role switcher</p>
      <div className="flex">
        {ROLES.map((item) => (
          <Link
            key={item.role}
            href={`${ROLE_HOME[item.role]}?as=${item.role}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              item.role === role ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
