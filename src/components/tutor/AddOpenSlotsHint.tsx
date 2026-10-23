"use client";

import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function AddOpenSlotsHint() {
  return (
    <Popover>
      <PopoverTrigger className={buttonVariants()}>
        <Plus aria-hidden="true" />
        Add open slots
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 gap-2 rounded-xl p-4">
        <p className="text-[15px] font-bold text-foreground">Open hours for booking</p>
        <p className="text-[13px] text-text-secondary">
          Choose any grey hour in the week to open it. Students and parents can book it straight away. Choose an open
          hour again to close it.
        </p>
      </PopoverContent>
    </Popover>
  );
}
