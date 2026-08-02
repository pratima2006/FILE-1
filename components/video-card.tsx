'use client'

import { Play } from 'lucide-react'
import { type Video, getArtist, thumbUrl } from '@/lib/catalog'
import { useApp } from '@/lib/store'

export function VideoCard({
  video,
  count,
  rank,
}: {
  video: Video
  count?: number
  rank?: number
}) {
  const { play, currentVideoId, isPlaying } = useApp()
  const artist = getArtist(video.artistId)
  const active = currentVideoId === video.id

  return (
    <button
      onClick={() => play(video.id)}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbUrl(video.id) || '/placeholder.svg'}
          alt={`${video.title} by ${artist.name}`}
          crossOrigin="anonymous"
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {typeof rank === 'number' && (
          <span className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-full bg-gold font-display text-sm font-bold text-gold-foreground">
            {rank}
          </span>
        )}

        <span className="absolute bottom-2 right-2 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
          <Play className="size-4 fill-current" />
        </span>

        {active && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
            <span className="relative flex size-1.5">
              <span
                className={`absolute inline-flex size-full rounded-full bg-current ${isPlaying ? 'animate-ping' : ''} opacity-75`}
              />
              <span className="relative inline-flex size-1.5 rounded-full bg-current" />
            </span>
            {isPlaying ? 'Playing' : 'Paused'}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-1 font-display text-sm font-semibold text-foreground">
          {video.title}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="line-clamp-1 text-xs text-muted-foreground">
            {artist.name} · {video.year}
          </span>
          {typeof count === 'number' && (
            <span className="shrink-0 text-xs font-semibold text-gold">
              {count.toLocaleString()} {count === 1 ? 'stream' : 'streams'}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
