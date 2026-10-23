"use server";

import { revalidatePath } from "next/cache";
import { setSavedOffline } from "@/lib/data/resources";
import { attempt, sessionUserId } from "./attempt";

export async function toggleSavedOffline(itemId: string, saved: boolean) {
  return attempt(async () => {
    const item = await setSavedOffline(await sessionUserId("student"), itemId, saved);
    revalidatePath("/student/library");
    return { saved: item.savedOffline };
  });
}
