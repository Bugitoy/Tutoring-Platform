import { getDemoSession } from "@/lib/data/profiles";

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

/** Data functions throw messages written for the user; hand them back instead of a generic error. */
export async function attempt<T extends object>(run: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, ...(await run()) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Something went wrong. Try again." };
  }
}

/** The signed-in user for a role, until auth exists. */
export async function sessionUserId(role: "student" | "parent" | "tutor"): Promise<string> {
  const session = await getDemoSession();
  return session[role].id;
}
