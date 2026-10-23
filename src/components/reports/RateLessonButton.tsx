"use client";

import { RatingStars } from "@/components/lessons/RatingStars";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function RateLessonButton() {
  return (
    <Popover>
      <PopoverTrigger className={buttonVariants({ variant: "outline" })}>Rate this lesson</PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <p className="text-sm font-semibold text-foreground">How was this lesson?</p>
        <RatingStars />
      </PopoverContent>
    </Popover>
  );
}
