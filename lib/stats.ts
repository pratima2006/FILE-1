import { type ArtistId, VIDEOS, getVideo } from './catalog'
import type { Stream } from './store'

export type Period = 'week' | 'month' | 'year' | 'all'

const PERIOD_MS: Record<Exclude<Period, 'all'>, number> = {
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
}

export function withinPeriod(streams: Stream[], period: Period): Stream[] {
  if (period === 'all') return streams
  const cutoff = Date.now() - PERIOD_MS[period]
  return streams.filter((s) => s.ts >= cutoff)
}

export type RankedVideo = {
  videoId: string
  count: number
  title: string
  artistId: ArtistId
}

export function topVideos(
  streams: Stream[],
  period: Period,
  limit = 10,
): RankedVideo[] {
  const scoped = withinPeriod(streams, period)
  const counts = new Map<string, number>()
  for (const s of scoped) {
    counts.set(s.videoId, (counts.get(s.videoId) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([videoId, count]) => {
      const v = getVideo(videoId)
      return {
        videoId,
        count,
        title: v?.title ?? videoId,
        artistId: (v?.artistId ?? 'bts') as ArtistId,
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function totalStreams(streams: Stream[], period: Period = 'all'): number {
  return withinPeriod(streams, period).length
}

export function artistStreamCount(
  streams: Stream[],
  artistId: ArtistId,
  period: Period = 'all',
): number {
  return withinPeriod(streams, period).filter((s) => s.artistId === artistId)
    .length
}

export function streamsByArtist(
  streams: Stream[],
  period: Period = 'all',
): Record<ArtistId, number> {
  const scoped = withinPeriod(streams, period)
  const base = {
    bts: 0,
    rm: 0,
    jin: 0,
    suga: 0,
    jhope: 0,
    jimin: 0,
    v: 0,
    jungkook: 0,
  } as Record<ArtistId, number>
  for (const s of scoped) base[s.artistId] += 1
  return base
}

export function artistVideoCount(artistId: ArtistId): number {
  return VIDEOS.filter((v) => v.artistId === artistId).length
}

// Last N days of daily counts, oldest -> newest, for the activity chart.
export function dailyActivity(streams: Stream[], days = 14) {
  const out: { label: string; count: number }[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const start = d.getTime()
    const end = start + 24 * 60 * 60 * 1000
    const count = streams.filter((s) => s.ts >= start && s.ts < end).length
    out.push({
      label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count,
    })
  }
  return out
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
