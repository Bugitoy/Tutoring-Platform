import { Suspense } from "react";
import { io } from "next/cache";
import { formatInTimeZone } from "date-fns-tz";
import { ParentProfileForm } from "@/components/profile/ParentProfileForm";
import { PLACEHOLDERS } from "@/config/placeholders";
import { defaultCard } from "@/lib/data/payments";
import { getChildrenForParent, getDemoSession } from "@/lib/data/profiles";
import { TIMEZONE, listNames } from "@/lib/format";
import type { NotificationPrefs } from "@/lib/types";

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  lesson_starting: { email: true, sms: false },
  report_sent: { email: true, sms: false },
  payment_request: { email: true, sms: true },
  lesson_missed: { email: true, sms: true },
  payment_update: { email: true, sms: false },
};

async function ParentProfile() {
  await io();
  const { parent } = await getDemoSession();
  const children = await getChildrenForParent(parent.id);
  const card = defaultCard(parent);
  const plan = parent.plan;

  return (
    <ParentProfileForm
      initials={parent.initials}
      initial={{
        fullName: parent.fullName,
        email: parent.email,
        phone: parent.phone ?? "",
        language: parent.language ?? "English",
        notifications: parent.notifications ?? DEFAULT_NOTIFICATIONS,
        children: children.map((child) => ({
          id: child.id,
          permissions: child.permissions,
          learningProfile: child.learningProfile,
        })),
      }}
      kids={children.map((child) => ({
        id: child.id,
        fullName: child.fullName,
        firstName: child.firstName,
        initials: child.initials,
        isUnder18: child.isUnder18,
        pronoun: child.pronoun,
        cardLast4: child.card?.last4,
      }))}
      plan={
        plan
          ? {
              covers: `Covers ${listNames(children.filter((child) => plan.covers.includes(child.id)).map((child) => child.firstName))}`,
              line: `${PLACEHOLDERS.PLUS_PRICE} / month · renews ${formatInTimeZone(new Date(`${plan.renewsOn}T12:00:00+02:00`), TIMEZONE, "d MMMM")}`,
            }
          : undefined
      }
      defaultCard={card ? `${card.brand === "visa" ? "Visa" : "Mastercard"} •••• ${card.last4} · expires ${card.expiry}` : undefined}
      twoStepSms={Boolean(parent.twoStepSms)}
    />
  );
}

export default function ParentProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
          <div className="h-20 rounded-xl bg-divider-soft" />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="h-[36rem] rounded-xl bg-divider-soft" />
            <div className="h-80 rounded-xl bg-divider-soft" />
          </div>
        </div>
      }
    >
      <ParentProfile />
    </Suspense>
  );
}
