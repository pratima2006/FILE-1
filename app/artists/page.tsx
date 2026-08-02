'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { ARTISTS } from '@/lib/catalog'
import { useApp } from '@/lib/store'
import { artistStreamCount, artistVideoCount } from '@/lib/stats'

function ArtistsContent() {
  const { streams } = useApp()
  const group = ARTISTS.filter((a) => a.id === 'bts')
  const members = ARTISTS.filter((a) => a.id !== 'bts')

  const renderCard = (artistId: (typeof ARTISTS)[number]['id']) => {
    const artist = ARTISTS.find((a) => a.id === artistId)!
    const count = artistStreamCount(streams, artist.id)
    const videos = artistVideoCount(artist.id)
    const initials = artist.name.slice(0, 2)
    return (
      <Link
        key={artist.id}
        href={`/artists/${artist.slug}`}
        className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10"
      >
        <span
          className="flex size-14 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold text-background"
          style={{ backgroundColor: artist.accent }}
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold">{artist.name}</p>
          <p className="truncate text-xs text-muted-foreground">{artist.role}</p>
          <p className="mt-1 text-xs">
            <span className="font-semibold text-gold">
              {count.toLocaleString()}
            </span>{' '}
            <span className="text-muted-foreground">streams · {videos} MVs</span>
          </p>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </Link>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Artists
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          BTS as a group, plus each member&apos;s solo work — tracked separately.
        </p>
      </header>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Group
        </h2>
        <div className="grid gap-3">{group.map((a) => renderCard(a.id))}</div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Solo
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map((a) => renderCard(a.id))}
        </div>
      </section>
    </div>
  )
}

export default function ArtistsPage() {
  return (
    <AppShell>
      <ArtistsContent />
    </AppShell>
  )
}
