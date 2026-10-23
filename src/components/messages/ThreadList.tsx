"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "cn";
import { Avatar } from "@/components/shared/Avatar";
import { Input } from "@/components/ui/input";
import type { ThreadSummary } from "./types";

type ThreadListProps = {
  threads: ThreadSummary[];
  selectedId?: string;
  searchPlaceholder: string;
};

export function ThreadList({ threads, selectedId, searchPlaceholder }: ThreadListProps) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const shown = threads.filter(
    (thread) => !needle || thread.name.toLowerCase().includes(needle) || thread.preview.toLowerCase().includes(needle),
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-3 p-4 pb-3">
        <h1 className="text-[22px] font-bold text-foreground">Messages</h1>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Search conversations"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 rounded-[10px] pl-9"
          />
        </div>
      </div>
      {shown.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          {threads.length === 0 ? "No conversations yet." : "No conversations match your search."}
        </p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {shown.map((thread) => {
            const selected = thread.id === selectedId;
            return (
              <li key={thread.id}>
                <Link
                  href={thread.href}
                  scroll={false}
                  aria-current={selected ? "true" : undefined}
                  className={cn(
                    "flex min-h-11 gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-subtle",
                    selected && "bg-accent hover:bg-accent",
                  )}
                >
                  <Avatar initials={thread.initials} size={44} className={thread.support ? "bg-navy text-on-navy" : undefined} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">{thread.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{thread.time}</span>
                    </span>
                    {thread.roleLine ? (
                      <span className="block truncate text-xs text-muted-foreground">{thread.roleLine}</span>
                    ) : null}
                    <span className="block truncate text-[13px] text-text-secondary">{thread.preview}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
