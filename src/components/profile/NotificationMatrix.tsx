"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { NotificationChannel, NotificationEvent, NotificationPrefs } from "@/lib/types";

const EVENTS: { id: NotificationEvent; label: string }[] = [
  { id: "lesson_starting", label: "A lesson is about to start" },
  { id: "report_sent", label: "A tutor sends a report" },
  { id: "payment_request", label: "A child asks me to pay for a lesson" },
  { id: "lesson_missed", label: "A lesson is missed or cancelled" },
  { id: "payment_update", label: "A payment goes through or is refunded" },
];

const CHANNELS: { id: NotificationChannel; label: string }[] = [
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS" },
];

type NotificationMatrixProps = {
  value: NotificationPrefs;
  onChange: (next: NotificationPrefs) => void;
};

export function NotificationMatrix({ value, onChange }: NotificationMatrixProps) {
  return (
    <table className="w-full border-collapse text-sm">
      <caption className="sr-only">Tell me when</caption>
      <thead>
        <tr>
          <th scope="col" className="pb-2 text-left text-xs font-semibold text-muted-foreground">
            Tell me when
          </th>
          {CHANNELS.map((channel) => (
            <th key={channel.id} scope="col" className="w-16 pb-2 text-center text-xs font-semibold text-muted-foreground">
              {channel.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {EVENTS.map((event) => (
          <tr key={event.id} className="border-t border-border">
            <th scope="row" className="py-3 pr-3 text-left font-normal text-foreground">
              {event.label}
            </th>
            {CHANNELS.map((channel) => (
              <td key={channel.id} className="py-3 text-center">
                <Checkbox
                  checked={value[event.id][channel.id]}
                  aria-label={`${channel.label}: ${event.label}`}
                  onCheckedChange={(checked) =>
                    onChange({ ...value, [event.id]: { ...value[event.id], [channel.id]: checked === true } })
                  }
                  className="size-5"
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
