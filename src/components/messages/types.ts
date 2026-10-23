import type { StatusTone } from "@/components/shared/StatusPill";

export type MessagesViewer = "student" | "parent" | "tutor";

export type ThreadSummary = {
  id: string;
  href: string;
  name: string;
  initials: string;
  /** "Physics tutor", "Parent of Neo" */
  roleLine?: string;
  time: string;
  preview: string;
  support: boolean;
};

export type OfferView = {
  /** "Thu 23 Oct, 17:00–18:00 · BGCSE Maths" */
  when: string;
  /** "P150 · Masego can accept and pay by card in one tap" */
  priceLine: string;
  acceptHref?: string;
  pill?: { label: string; tone: StatusTone };
};

export type ChatItem =
  | { type: "day"; id: string; label: string }
  | {
      type: "message";
      id: string;
      mine: boolean;
      /** "12:10" or "12:10 · Read" */
      meta: string;
      text?: string;
      file?: { name: string; kind: "pdf" | "img"; note: string };
      offer?: OfferView;
    };

export type ContextCard = {
  title: string;
  lines: string[];
  pill?: { label: string; tone: StatusTone };
  link?: { label: string; href: string };
};

/** `label` is "Thu 23 Oct"; each slot's `range` is "17:00–18:00". */
export type OfferSlotDay = { date: string; label: string; slots: { start: string; time: string; range: string }[] };
export type OfferCourse = { curriculumId: string; subjectId: string; label: string; price: string };

export type OfferComposer = {
  recipientName: string;
  days: OfferSlotDay[];
  courses: OfferCourse[];
};

export type ConversationView = {
  threadId: string;
  name: string;
  initials: string;
  roleLine?: string;
  action?: { label: string; href: string };
  items: ChatItem[];
  context?: ContextCard;
  safety: { lead: string; text: string };
  offer?: OfferComposer;
};
