"use server";

import { revalidatePath } from "next/cache";
import { addCard, setMonthlyStatement, type CardInput } from "@/lib/data/payments";
import { getDemoSession } from "@/lib/data/profiles";
import { attempt } from "./attempt";

export async function saveNewCard(role: "student" | "parent", input: CardInput) {
  return attempt(async () => {
    const session = await getDemoSession();
    const card = await addCard(role === "student" ? session.student : session.parent, input);
    revalidatePath(`/${role}/payments`);
    revalidatePath(`/${role}/profile`);
    return { last4: card.last4 };
  });
}

export async function updateMonthlyStatement(on: boolean) {
  return attempt(async () => {
    const { parent } = await getDemoSession();
    await setMonthlyStatement(parent.id, on);
    revalidatePath("/parent/payments");
    return {};
  });
}
