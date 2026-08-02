'use client'

export function ActivityChart({
  data,
}: {
  data: { label: string; count: number }[]
}) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="flex h-40 items-end gap-1.5">
      {data.map((d, i) => {
        const pct = (d.count / max) * 100
        return (
          <div key={i} className="group flex flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t bg-primary/70 transition-all group-hover:bg-primary"
                style={{ height: `${Math.max(pct, d.count > 0 ? 6 : 2)}%` }}
              >
                <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-gold opacity-0 transition-opacity group-hover:opacity-100">
                  {d.count}
                </span>
              </div>
            </div>
            <span className="w-full truncate text-center text-[9px] text-muted-foreground">
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
