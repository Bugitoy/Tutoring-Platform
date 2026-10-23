import { cn } from "cn";

const TINTS = ["bg-avatar-1", "bg-avatar-2", "bg-avatar-3", "bg-avatar-4", "bg-avatar-5"];

type AvatarProps = {
  initials: string;
  size?: 36 | 44 | 48 | 52 | 56 | 72;
  className?: string;
};

export function Avatar({ initials, size = 56, className }: AvatarProps) {
  const tint = TINTS[[...initials].reduce((sum, char) => sum + char.charCodeAt(0), 0) % TINTS.length];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold text-foreground",
        tint,
        size === 36 && "size-9 text-xs",
        size === 44 && "size-11 text-sm",
        size === 48 && "size-12 text-sm",
        size === 52 && "size-13 text-base",
        size === 56 && "size-14 text-base",
        size === 72 && "size-18 text-xl",
        className,
      )}
    >
      {initials}
    </span>
  );
}
