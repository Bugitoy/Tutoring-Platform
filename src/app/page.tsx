import { redirect } from "next/navigation";
import { ROLE_HOME, type Role } from "@/config/nav";

const ROLES = new Set<Role>(["student", "parent", "tutor"]);

export const instant = false;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string }>;
}) {
  const { as } = await searchParams;
  if (as && ROLES.has(as as Role)) {
    redirect(ROLE_HOME[as as Role]);
  }
  redirect(ROLE_HOME.student);
}
