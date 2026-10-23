import { Suspense } from "react";
import { io } from "next/cache";
import { TutorProfileForm } from "@/components/tutor/TutorProfileForm";
import { getDemoSession } from "@/lib/data/profiles";

async function TutorProfile() {
  await io();
  const { tutor } = await getDemoSession();
  return <TutorProfileForm tutor={tutor} />;
}

export default function TutorProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
          <div className="h-16 rounded-xl bg-divider-soft" />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="h-[40rem] rounded-xl bg-divider-soft" />
            <div className="h-72 rounded-xl bg-divider-soft" />
          </div>
        </div>
      }
    >
      <TutorProfile />
    </Suspense>
  );
}
