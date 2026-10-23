"use client";

import { useId, useState, type ReactNode } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { cn } from "cn";
import { Textarea } from "@/components/ui/textarea";

export type ToolsTab = "whiteboard" | "chat" | "notes";

type LessonToolsProps = {
  tab: ToolsTab;
  onTabChange: (tab: ToolsTab) => void;
  unread: number;
  whiteboard: ReactNode;
  chat: ReactNode;
  goal?: string;
};

// TODO(spec): lesson notes aren't designed; v1 shows the lesson goal and private notes kept on this device.
function LessonNotes({ goal }: { goal?: string }) {
  const id = useId();
  const [notes, setNotes] = useState("");
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4">
      {goal ? (
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground">Lesson goal</h2>
          <p className="mt-1 text-sm font-semibold text-foreground">{goal}</p>
        </section>
      ) : null}
      <p className="text-sm text-text-secondary">
        The whiteboard is saved to your lesson notes. You’ll find it with the summary after class.
      </p>
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor={`${id}-notes`} className="text-[13px] font-semibold text-foreground">
          My notes
        </label>
        <Textarea
          id={`${id}-notes`}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Anything you want to remember"
          className="min-h-32 flex-1"
        />
        <p className="text-xs text-muted-foreground">Only you can see these.</p>
      </div>
    </div>
  );
}

export function LessonTools({ tab, onTabChange, unread, whiteboard, chat, goal }: LessonToolsProps) {
  const tabs: { value: ToolsTab; label: ReactNode }[] = [
    { value: "whiteboard", label: "Whiteboard" },
    {
      value: "chat",
      label: (
        <>
          Chat
          {unread > 0 ? (
            <span>
              {" "}· {unread}
              <span className="sr-only"> unread</span>
            </span>
          ) : null}
        </>
      ),
    },
    {
      value: "notes",
      label: (
        <>
          <span className="sm:hidden">Notes</span>
          <span className="hidden sm:inline">Lesson notes</span>
        </>
      ),
    },
  ];

  return (
    <Tabs.Root
      value={tab}
      onValueChange={(value) => onTabChange(value as ToolsTab)}
      className="flex min-h-0 flex-1 flex-col gap-3 sm:min-h-[480px] sm:flex-[1_1_420px] sm:gap-0 sm:overflow-hidden sm:rounded-2xl sm:bg-card sm:text-card-foreground"
    >
      <Tabs.List
        aria-label="Lesson tools"
        className="flex shrink-0 gap-1 rounded-xl bg-room-panel p-1 sm:rounded-none sm:border-b sm:border-border sm:bg-divider-soft"
      >
        {tabs.map((item) => (
          <Tabs.Tab
            key={item.value}
            value={item.value}
            className={cn(
              "h-11 flex-1 rounded-lg px-3 text-sm font-semibold text-room-text sm:h-10 sm:text-muted-foreground",
              "data-active:bg-brand-sky data-active:text-brand-sky-foreground sm:data-active:bg-card sm:data-active:text-foreground sm:data-active:shadow-[0_1px_2px_color-mix(in_srgb,var(--foreground)_15%,transparent)]",
            )}
          >
            {item.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-card text-card-foreground sm:rounded-none">
        <Tabs.Panel value="whiteboard" keepMounted className="h-full outline-none">
          {whiteboard}
        </Tabs.Panel>
        <Tabs.Panel value="chat" className="h-full outline-none">
          {chat}
        </Tabs.Panel>
        <Tabs.Panel value="notes" keepMounted className="h-full outline-none">
          <LessonNotes goal={goal} />
        </Tabs.Panel>
      </div>
    </Tabs.Root>
  );
}
