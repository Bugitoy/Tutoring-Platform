"use server";

import { revalidatePath } from "next/cache";
import { nowIso } from "@/lib/clock";
import { sendMessage, shareFile } from "@/lib/data/messages";
import type { FileRef, OfferInput } from "@/lib/types";
import { attempt, sessionUserId } from "./attempt";

type Viewer = "student" | "parent" | "tutor";

function refresh() {
  revalidatePath("/student/messages");
  revalidatePath("/parent/messages");
  revalidatePath("/tutor/messages");
}

export async function sendThreadMessage(viewer: Viewer, threadId: string, input: { text?: string; offer?: OfferInput }) {
  return attempt(async () => {
    if (input.offer && viewer !== "tutor") throw new Error("Only tutors can offer lesson times.");
    const { masked } = await sendMessage(threadId, await sessionUserId(viewer), input, nowIso());
    refresh();
    return { masked };
  });
}

export async function shareThreadFile(viewer: Viewer, threadId: string, file: Pick<FileRef, "name" | "kind" | "sizeKb">) {
  return attempt(async () => {
    await shareFile(threadId, await sessionUserId(viewer), file, nowIso());
    refresh();
    revalidatePath("/student/library");
    return {};
  });
}
