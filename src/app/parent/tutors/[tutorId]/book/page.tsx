import { Suspense } from "react";
import { BookPage } from "@/components/booking/BookPage";

export default function ParentBookRoute({
  params,
  searchParams,
}: {
  params: Promise<{ tutorId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={null}>
      <BookPage role="parent" params={params} searchParams={searchParams} />
    </Suspense>
  );
}
