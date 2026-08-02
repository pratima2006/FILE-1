'use client'

import { Clock, Download, Trash2 } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { getArtist, getVideo, thumbUrl } from '@/lib/catalog'
import { useApp } from '@/lib/store'
import { relativeTime } from '@/lib/stats'

function dayKey(ts: number) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function dayLabel(ts: number) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((today.getTime() - ts) / (24 * 60 * 60 * 1000))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function HistoryContent() {
  const { streams, play, clearHistory } = useApp()

  // Group streams by day.
  const groups = new Map<number, typeof streams>()
  for (const s of streams) {
    const key = dayKey(s.ts)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(s)
  }
  const orderedDays = [...groups.keys()].sort((a, b) => b - a)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            History
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {streams.length.toLocaleString()} streams tracked. Newest first.
          </p>
        </div>
        {streams.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear all tracked stream history? This cannot be undone.'))
                clearHistory()
            }}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
          >
            <Trash2 className="size-3.5" /> Clear
          </button>
        )}
      </header>

      {streams.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 py-20 text-center">
          <Clock className="size-8 text-muted-foreground" />
          <p className="font-display text-lg font-semibold">No history yet</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Finish streaming an MV to start your timeline, or import your old
            YouTube history.
          </p>
          <a
            href="/import"
            className="mt-2 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Download className="size-4" /> Import history
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {orderedDays.map((day) => (
            <section key={day}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-gold">
                  {dayLabel(day)}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {groups.get(day)!.length} streams
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <ol className="relative flex flex-col gap-2 border-l border-border pl-4">
                {groups.get(day)!.map((s) => {
                  const video = getVideo(s.videoId)
                  const artist = getArtist(s.artistId)
                  if (!video) return null
                  return (
                    <li key={s.id} className="relative">
                      <span className="absolute -left-[21px] top-5 size-2 rounded-full bg-primary ring-4 ring-background" />
                      <button
                        onClick={() => play(s.videoId)}
                        className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-2.5 text-left transition-colors hover:border-primary/60"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbUrl(s.videoId) || '/placeholder.svg'}
                          alt={video.title}
                          crossOrigin="anonymous"
                          className="h-10 w-16 shrink-0 rounded-md object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {video.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {artist.name}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="text-xs text-muted-foreground">
                            {relativeTime(s.ts)}
                          </span>
                          {s.source === 'takeout' && (
                            <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">
                              Imported
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HistoryPage() {
  return (
    <AppShell>
      <HistoryContent />
    </AppShell>
  )
}
