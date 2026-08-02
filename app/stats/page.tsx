'use client'

import { useState } from 'react'
import { Calendar, Music, Play, Trophy } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { ActivityChart } from '@/components/activity-chart'
import { getArtist, getVideo, thumbUrl } from '@/lib/catalog'
import { useApp } from '@/lib/store'
import {
  type Period,
  dailyActivity,
  totalStreams,
  topVideos,
} from '@/lib/stats'

const PERIODS: { id: Period; label: string }[] = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
  { id: 'all', label: 'All Time' },
]

function StatsContent() {
  const { streams, currentVideoId, play } = useApp()
  const [period, setPeriod] = useState<Period>('week')

  const top = topVideos(streams, period, 10)
  const periodTotal = totalStreams(streams, period)
  const allTotal = totalStreams(streams, 'all')
  const activity = dailyActivity(streams, 14)

  const nowVideo = currentVideoId ? getVideo(currentVideoId) : null
  const nowArtist = nowVideo ? getArtist(nowVideo.artistId) : null

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Your Stats
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every completed stream, counted for BTS.
        </p>
      </header>

      {/* Top totals */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="size-4" />
            <span className="text-xs">All-time streams</span>
          </div>
          <p className="mt-2 font-display text-3xl font-bold">
            {allTotal.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-4" />
            <span className="text-xs">
              Streams · {PERIODS.find((p) => p.id === period)?.label}
            </span>
          </div>
          <p className="mt-2 font-display text-3xl font-bold">
            {periodTotal.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Play className="size-4" />
            <span className="text-xs">Now playing</span>
          </div>
          <p className="mt-2 line-clamp-1 font-display text-lg font-bold">
            {nowVideo ? nowVideo.title : 'Nothing yet'}
          </p>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {nowArtist ? nowArtist.name : 'Press play on any MV'}
          </p>
        </div>
      </section>

      {/* Activity chart */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display text-lg font-bold">
          Last 14 days activity
        </h2>
        <ActivityChart data={activity} />
      </section>

      {/* Top MVs with period toggle */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold">Top MVs</h2>
          <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-card p-1">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  period === p.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {top.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 py-16 text-center">
            <Music className="size-8 text-muted-foreground" />
            <p className="font-display font-semibold">No streams yet</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Play an MV on the Today page and let it finish to see it ranked here.
            </p>
          </div>
        ) : (
          <ol className="flex flex-col gap-2">
            {top.map((v, i) => {
              const artist = getArtist(v.artistId)
              return (
                <li key={v.videoId}>
                  <button
                    onClick={() => play(v.videoId)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/60"
                  >
                    <span className="w-6 shrink-0 text-center font-display text-lg font-bold text-gold">
                      {i + 1}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumbUrl(v.videoId) || '/placeholder.svg'}
                      alt={v.title}
                      crossOrigin="anonymous"
                      className="h-12 w-20 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display font-semibold">
                        {v.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {artist.name}
                      </p>
                    </div>
                    <span className="shrink-0 font-display text-sm font-bold text-primary">
                      {v.count.toLocaleString()}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}

export default function StatsPage() {
  return (
    <AppShell>
      <StatsContent />
    </AppShell>
  )
}
