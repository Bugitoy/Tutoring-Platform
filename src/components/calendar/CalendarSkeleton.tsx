export function CalendarSkeleton({ hero = false }: { hero?: boolean }) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading lessons">
      {hero ? <div className="h-52 rounded-2xl bg-divider-soft" /> : null}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="h-[560px] rounded-xl bg-divider-soft" />
        <div className="flex flex-col gap-4">
          <div className="h-48 rounded-xl bg-divider-soft" />
          <div className="h-40 rounded-xl bg-divider-soft" />
        </div>
      </div>
    </div>
  );
}
