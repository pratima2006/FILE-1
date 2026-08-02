'use client'

import { use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Play } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { VideoCard } from '@/components/video-card'
import { VIDEOS, getArtistBySlug } from '@/lib/catalog'
import { useApp } from '@/lib/store'
import { artistStreamCount, topVideos } from '@/lib/stats'

function ArtistDetail({ slug }: { slug: string }) {
  const { streams, play } = useApp()
  const artist = getArtistBySlug(slug)
  if (!artist) notFound()

  const videos = VIDEOS.filter((v) => v.artistId === artist.id)
  const total = artistStreamCount(streams, artist.id)
  const week = artistStreamCount(streams, artist.id, 'week')
  const month = artistStreamCount(streams, artist.id, 'month')

  // Top MV for this artist (filter global ranking to this artist).
  const artistTop = topVideos(
    streams.filter((s) => s.artistId === artist.id),
    'all',
    1,
  )[0]

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/artists"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All artists
      </Link>

      {/* Hero */}
      <header
        className="relative overflow-hidden rounded-2xl border border-border p-6 sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${artist.accent}33, transparent 70%)`,
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span
            className="flex size-20 shrink-0 items-center justify-center rounded-full font-display text-2xl font-bold text-background"
            style={{ backgroundColor: artist.accent }}
          >
            {artist.name.slice(0, 2)}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {artist.role}
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {artist.name}
            </h1>
            <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
              {artist.bio}
            </p>
          </div>
        </div>
      </header>

      {/* Stat strip */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { label: 'All-time', value: total },
          { label: 'This month', value: month },
          { label: 'This week', value: week },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-4 text-center"
          >
            <p className="font-display text-2xl font-bold text-foreground">
              {s.value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      {artistTop && (
        <section className="rounded-xl border border-gold/40 bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">
            Most streamed
          </p>
          <p className="mt-1 font-display text-lg font-bold">
            {artistTop.title}{' '}
            <span className="text-sm font-normal text-muted-foreground">
              · {artistTop.count.toLocaleString()} streams
            </span>
          </p>
        </section>
      )}

      {/* Videos */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">
            Videos ({videos.length})
          </h2>
          {videos.length > 0 && (
            <button
              onClick={() => play(videos[0].id)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              <Play className="size-3.5 fill-current" /> Play all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  return (
    <AppShell>
      <ArtistDetail slug={slug} />
    </AppShell>
  )
}
