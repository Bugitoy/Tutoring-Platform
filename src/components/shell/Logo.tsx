import { cn } from "cn";

type LogoProps = {
  className?: string;
  wordmarkClassName?: string;
};

export function Logo({ className, wordmarkClassName }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className="flex size-8 items-center justify-center rounded-md bg-brand-sky text-sm font-bold text-brand-sky-foreground"
        aria-hidden="true"
      >
        T
      </span>
      <span className={cn("text-lg font-bold text-foreground", wordmarkClassName)}>Thanodi</span>
    </div>
  );
}
