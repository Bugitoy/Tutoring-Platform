import { MessagesPage } from "@/components/messages/MessagesPage";

export default function TutorMessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <MessagesPage viewer="tutor" searchParams={searchParams} />;
}
