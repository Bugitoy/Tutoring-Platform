import { redirect } from "next/navigation";
import { ROLE_HOME } from "@/config/nav";

export default function StudentIndexPage() {
  redirect(ROLE_HOME.student);
}
