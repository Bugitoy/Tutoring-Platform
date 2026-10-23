"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "cn";

export function RatingStars({ label = "How was this lesson?" }: { label?: string }) {
  const [rating, setRating] = useState(0);
  return (
    <div role="group" aria-label={label} className="flex gap-2">
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= rating;
        return (
          <button
            key={value}
            type="button"
            aria-label={`Rate ${value} out of 5`}
            aria-pressed={rating === value}
            onClick={() => setRating(value)}
            className="inline-flex size-11 items-center justify-center rounded-lg border border-input bg-card hover:bg-surface-subtle"
          >
            <Star
              aria-hidden="true"
              className={cn("size-5 text-highlight-border", filled || rating === 0 ? "fill-highlight-border" : "fill-transparent")}
            />
          </button>
        );
      })}
    </div>
  );
}
