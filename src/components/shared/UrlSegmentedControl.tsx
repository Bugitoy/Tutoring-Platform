"use client";

import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SegmentedControl } from "@/components/shared/SegmentedControl";

type UrlSegmentedControlProps<T extends string> = {
  param: string;
  value: T;
  options: { value: T; label: string }[];
  label: string;
  className?: string;
};

/** A segmented control whose value lives in a query param, e.g. `?child=neo`. */
export function UrlSegmentedControl<T extends string>({ param, value, options, label, className }: UrlSegmentedControlProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [current, setCurrent] = useOptimistic(value);

  return (
    <div className={className}>
      <SegmentedControl
        label={label}
        value={current}
        options={options}
        onChange={(next) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set(param, next);
          startTransition(() => {
            setCurrent(next);
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
          });
        }}
      />
    </div>
  );
}
