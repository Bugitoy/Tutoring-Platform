import { MessagesPage } from "@/components/messages/MessagesPage";

export default function StudentMessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <MessagesPage viewer="student" searchParams={searchParams} />;
}
