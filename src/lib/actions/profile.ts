"use server";

import { revalidatePath } from "next/cache";
import { updateParentProfile, updateStudentProfile } from "@/lib/data/profiles";
import type { ParentProfileInput, StudentProfileInput } from "@/lib/types";
import { attempt, sessionUserId } from "./attempt";

export async function saveStudentProfile(input: StudentProfileInput) {
  return attempt(async () => {
    await updateStudentProfile(await sessionUserId("student"), input);
    revalidatePath("/student", "layout");
    revalidatePath("/parent", "layout");
    return {};
  });
}

export async function saveParentProfile(input: ParentProfileInput) {
  return attempt(async () => {
    await updateParentProfile(await sessionUserId("parent"), input);
    revalidatePath("/parent", "layout");
    revalidatePath("/student", "layout");
    return {};
  });
}
