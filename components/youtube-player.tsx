'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { getArtist, getVideo } from '@/lib/catalog'
import { useApp } from '@/lib/store'

// Minimal typing for the YouTube IFrame API we use.
type YTPlayer = {
  loadVideoById: (id: string) => void
  playVideo: () => void
  pauseVideo: () => void
  destroy: () => void
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: Record<string, unknown>,
      ) => YTPlayer
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<void> | null = null

function loadYouTubeAPI(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.YT?.Player) return Promise.resolve()
  if (apiPromise) return apiPromise
  apiPromise = new Promise<void>((resolve) => {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    document.head.appendChild(tag)
  })
  return apiPromise
}

export function YouTubePlayer() {
  const { currentVideoId, recordStream, setPlaying, stop } = useApp()
  const holderRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const readyRef = useRef(false)
  const currentIdRef = useRef<string | null>(null)
  const [minimized, setMinimized] = useState(false)

  currentIdRef.current = currentVideoId

  // Create the player instance once.
  useEffect(() => {
    let cancelled = false
    loadYouTubeAPI().then(() => {
      if (cancelled || !holderRef.current || playerRef.current) return
      playerRef.current = new window.YT!.Player(holderRef.current, {
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            readyRef.current = true
            if (currentIdRef.current) {
              playerRef.current?.loadVideoById(currentIdRef.current)
            }
          },
          onStateChange: (e: { data: number }) => {
            const YT = window.YT!
            if (e.data === YT.PlayerState.ENDED) {
              if (currentIdRef.current) recordStream(currentIdRef.current)
              setPlaying(false)
            } else if (e.data === YT.PlayerState.PLAYING) {
              setPlaying(true)
            } else if (e.data === YT.PlayerState.PAUSED) {
              setPlaying(false)
            }
          },
        },
      })
    })
    return () => {
      cancelled = true
    }
  }, [recordStream, setPlaying])

  // Load a new video whenever the selection changes.
  useEffect(() => {
    if (!currentVideoId) return
    setMinimized(false)
    if (readyRef.current && playerRef.current) {
      playerRef.current.loadVideoById(currentVideoId)
    }
  }, [currentVideoId])

  const video = currentVideoId ? getVideo(currentVideoId) : null
  const artist = video ? getArtist(video.artistId) : null

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-border bg-popover/95 backdrop-blur transition-transform duration-300 ${
        currentVideoId ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-hidden={!currentVideoId}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 sm:px-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-semibold text-foreground">
            {video?.title ?? 'Nothing playing'}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {artist ? `${artist.name} · Now streaming for ARMY` : ''}
          </p>
        </div>
        <button
          onClick={() => setMinimized((m) => !m)}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={minimized ? 'Expand player' : 'Minimize player'}
        >
          {minimized ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
        <button
          onClick={stop}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close player"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* The iframe host. Kept mounted; height collapses when minimized. */}
      <div
        className={`mx-auto max-w-6xl overflow-hidden px-3 transition-all duration-300 sm:px-4 ${
          minimized ? 'h-0 pb-0' : 'pb-3'
        }`}
      >
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <div ref={holderRef} className="size-full" />
        </div>
      </div>
    </div>
  )
}
