"use client";

import { TileRadioGroup, type TileOption } from "@/components/shared/TileRadioGroup";

type Payer = "student" | "parent";

type WhoPaysPickerProps = {
  value: Payer;
  parentName: string;
  allowSelf: boolean;
  allowParent: boolean;
  onChange: (value: Payer) => void;
};

export function WhoPaysPicker({ value, parentName, allowSelf, allowParent, onChange }: WhoPaysPickerProps) {
  const options: TileOption<Payer>[] = [
    ...(allowSelf
      ? [{ value: "student" as const, label: "I’ll pay", description: "Pay now with your own debit or credit card." }]
      : []),
    ...(allowParent
      ? [
          {
            value: "parent" as const,
            label: `Ask ${parentName} (parent) to pay`,
            description: "She gets a request. The time is held for 12 hours.",
          },
        ]
      : []),
  ];

  return (
    <div>
      <TileRadioGroup label="Who’s paying?" value={value} options={options} onChange={onChange} />
      <p className="mt-3 text-xs text-muted-foreground">
        Only shown if your account is linked to a parent. Students without a linked parent always pay themselves.
      </p>
    </div>
  );
}
