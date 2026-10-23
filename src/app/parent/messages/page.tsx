import { MessagesPage } from "@/components/messages/MessagesPage";

export default function ParentMessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <MessagesPage viewer="parent" searchParams={searchParams} />;
}
