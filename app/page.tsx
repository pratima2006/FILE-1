'use client'

import { Flame, Play, Sparkles, TrendingUp } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { VideoCard } from '@/components/video-card'
import { VIDEOS, getArtist, getVideo, thumbUrl } from '@/lib/catalog'
import { useApp } from '@/lib/store'
import { topVideos, totalStreams } from '@/lib/stats'

function todaysFocus(count = 4) {
  // Deterministic daily rotation so "Today's Focus" is stable across a day.
  const now = new Date()
  const seed =
    now.getFullYear() * 1000 + (now.getMonth() + 1) * 40 + now.getDate()
  const start = seed % VIDEOS.length
  const picks = []
  for (let i = 0; i < count; i++) {
    picks.push(VIDEOS[(start + i * 3) % VIDEOS.length])
  }
  return picks
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function DashboardContent() {
  const { streams, currentVideoId, play } = useApp()
  const focus = todaysFocus()
  const total = totalStreams(streams)
  const today = streams.filter((s) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return s.ts >= d.getTime()
  }).length
  const topWeek = topVideos(streams, 'week', 1)[0]
  const nowVideo = currentVideoId ? getVideo(currentVideoId) : null
  const nowArtist = nowVideo ? getArtist(nowVideo.artistId) : null

  const stats = [
    { label: 'Total streams', value: total.toLocaleString(), icon: TrendingUp },
    { label: 'Streamed today', value: today.toLocaleString(), icon: Flame },
    {
      label: 'Top MV this week',
      value: topWeek ? topWeek.title : '—',
      icon: Sparkles,
      small: true,
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-sm text-muted-foreground">{greeting()}, ARMY</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Ready to stream for BTS?
        </h1>
      </header>

      {/* Stat strip */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="size-4" />
                <span className="text-xs">{s.label}</span>
              </div>
              <p
                className={`mt-2 font-display font-bold text-foreground ${
                  s.small ? 'line-clamp-1 text-base' : 'text-2xl'
                }`}
              >
                {s.value}
              </p>
            </div>
          )
        })}
      </section>

      {/* Now playing highlight */}
      {nowVideo && nowArtist && (
        <section className="relative overflow-hidden rounded-2xl border border-primary/40 bg-card">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${thumbUrl(nowVideo.id, 'max')})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative flex items-center gap-4 p-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbUrl(nowVideo.id) || '/placeholder.svg'}
              alt={nowVideo.title}
              crossOrigin="anonymous"
              className="hidden size-20 rounded-lg object-cover sm:block"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                <Play className="size-3 fill-current" /> Now playing
              </p>
              <p className="mt-1 truncate font-display text-xl font-bold">
                {nowVideo.title}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {nowArtist.name} · {nowVideo.era}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Today's Focus */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Today&apos;s Focus</h2>
            <p className="text-sm text-muted-foreground">
              A fresh set of MVs to stream today. Finish one to count it.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {focus.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </section>

      {/* Full catalog */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">The Catalog</h2>
          <button
            onClick={() => play(VIDEOS[0].id)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
          >
            <Play className="size-3.5 fill-current" /> Play first
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {VIDEOS.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default function HomePage() {
  return (
    <AppShell>
      <DashboardContent />
    </AppShell>
  )
}
