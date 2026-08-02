'use client'

// Borahae.fm data layer — Supabase edition.
//
// Single source of truth for auth, streams, and now-playing state.
// - Auth: Supabase Auth with Google OAuth only (one-click login/logout).
// - Streams: stored in the `streams` table. RLS guarantees each user can only
//   read/insert/delete their OWN rows, so "My Streams" counts stay private.
// - weeklyTop: anonymous aggregate across ALL army via the get_weekly_top_mvs
//   RPC (returns only video titles + counts, never any user data).
//
// Components never touch Supabase directly — they only use the useApp() hook.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { type ArtistId, TRACKED_IDS, getVideo } from './catalog'
import { createClient } from './supabase/client'

export type Stream = {
  id: string
  videoId: string
  artistId: ArtistId
  ts: number // epoch ms
  source: 'player' | 'takeout'
}

export type User = {
  name: string
  email: string
  avatar: string
}

export type WeeklyTopMv = {
  videoId: string
  videoTitle: string
  streams: number
}

type AppState = {
  ready: boolean
  user: User | null
  streams: Stream[]
  weeklyTop: WeeklyTopMv[]
  // now playing
  currentVideoId: string | null
  isPlaying: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  play: (videoId: string) => void
  stop: () => void
  setPlaying: (playing: boolean) => void
  recordStream: (videoId: string, source?: Stream['source']) => Promise<void>
  importTakeout: (rows: { videoId: string; ts: number }[]) => Promise<number>
  clearHistory: () => Promise<void>
  refreshWeeklyTop: () => Promise<void>
}

const AppContext = createContext<AppState | null>(null)

const supabase = createClient()

type DbStream = {
  id: string
  video_id: string
  video_title: string
  watched_at: string
}

function toStream(row: DbStream): Stream | null {
  const video = getVideo(row.video_id)
  if (!video) return null
  return {
    id: row.id,
    videoId: row.video_id,
    artistId: video.artistId,
    ts: new Date(row.watched_at).getTime(),
    source: 'player',
  }
}

function mapAuthUser(u: {
  email?: string | null
  user_metadata?: Record<string, unknown>
}): User {
  const meta = u.user_metadata ?? {}
  return {
    name:
      (meta.full_name as string) ||
      (meta.name as string) ||
      (u.email ? u.email.split('@')[0] : 'ARMY'),
    email: u.email ?? '',
    avatar:
      (meta.avatar_url as string) ||
      (meta.picture as string) ||
      '/army-avatar.png',
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [streams, setStreams] = useState<Stream[]>([])
  const [weeklyTop, setWeeklyTop] = useState<WeeklyTopMv[]>([])
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const lastRecorded = useRef<{ id: string; ts: number } | null>(null)
  const userIdRef = useRef<string | null>(null)

  const loadStreams = useCallback(async () => {
    const { data, error } = await supabase
      .from('streams')
      .select('id, video_id, video_title, watched_at')
      .order('watched_at', { ascending: false })
    if (error) {
      console.log('[v0] loadStreams error:', error.message)
      return
    }
    const mapped = (data as DbStream[])
      .map(toStream)
      .filter((s): s is Stream => s !== null)
    setStreams(mapped)
  }, [])

  const refreshWeeklyTop = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_weekly_top_mvs', {
      lim: 10,
    })
    if (error) {
      console.log('[v0] weeklyTop error:', error.message)
      return
    }
    const rows = (data as { video_id: string; video_title: string; streams: number }[]) ?? []
    setWeeklyTop(
      rows.map((r) => ({
        videoId: r.video_id,
        videoTitle: r.video_title,
        streams: Number(r.streams),
      })),
    )
  }, [])

  // Establish session + subscribe to auth changes.
  useEffect(() => {
    let mounted = true

    async function init() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!mounted) return
      if (authUser) {
        userIdRef.current = authUser.id
        setUser(mapAuthUser(authUser))
        await loadStreams()
      }
      await refreshWeeklyTop()
      if (mounted) setReady(true)
    }
    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null
      if (authUser) {
        const changed = userIdRef.current !== authUser.id
        userIdRef.current = authUser.id
        setUser(mapAuthUser(authUser))
        if (changed) loadStreams()
      } else {
        userIdRef.current = null
        setUser(null)
        setStreams([])
        setCurrentVideoId(null)
        setIsPlaying(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadStreams, refreshWeeklyTop])

  const login = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
      },
    })
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    userIdRef.current = null
    setUser(null)
    setStreams([])
    setCurrentVideoId(null)
    setIsPlaying(false)
  }, [])

  const recordStream = useCallback(
    async (videoId: string, _source: Stream['source'] = 'player') => {
      if (!TRACKED_IDS.has(videoId)) return // allow-list only
      const video = getVideo(videoId)
      if (!video) return
      const uid = userIdRef.current
      if (!uid) return

      // de-dupe accidental double "ended" events within 3s
      const now = Date.now()
      if (
        lastRecorded.current &&
        lastRecorded.current.id === videoId &&
        now - lastRecorded.current.ts < 3000
      ) {
        return
      }
      lastRecorded.current = { id: videoId, ts: now }

      const watchedAt = new Date(now).toISOString()
      const { data, error } = await supabase
        .from('streams')
        .insert({
          user_id: uid,
          video_id: videoId,
          video_title: video.title,
          watched_at: watchedAt,
        })
        .select('id, video_id, video_title, watched_at')
        .single()

      if (error) {
        console.log('[v0] recordStream error:', error.message)
        return
      }

      const inserted = toStream(data as DbStream)
      if (inserted) setStreams((prev) => [inserted, ...prev])
      refreshWeeklyTop()
    },
    [refreshWeeklyTop],
  )

  const play = useCallback((videoId: string) => {
    if (!TRACKED_IDS.has(videoId)) return
    setCurrentVideoId(videoId)
    setIsPlaying(true)
  }, [])

  const stop = useCallback(() => {
    setCurrentVideoId(null)
    setIsPlaying(false)
  }, [])

  const importTakeout = useCallback(
    async (rows: { videoId: string; ts: number }[]) => {
      const uid = userIdRef.current
      if (!uid) return 0
      const valid = rows.filter((r) => TRACKED_IDS.has(r.videoId))
      if (valid.length === 0) return 0

      const payload = valid.map((r) => {
        const video = getVideo(r.videoId)!
        return {
          user_id: uid,
          video_id: r.videoId,
          video_title: video.title,
          watched_at: new Date(r.ts).toISOString(),
        }
      })

      const { error } = await supabase.from('streams').insert(payload)
      if (error) {
        console.log('[v0] importTakeout error:', error.message)
        return 0
      }
      await loadStreams()
      refreshWeeklyTop()
      return valid.length
    },
    [loadStreams, refreshWeeklyTop],
  )

  const clearHistory = useCallback(async () => {
    const uid = userIdRef.current
    if (!uid) return
    const { error } = await supabase
      .from('streams')
      .delete()
      .eq('user_id', uid)
    if (error) {
      console.log('[v0] clearHistory error:', error.message)
      return
    }
    setStreams([])
    refreshWeeklyTop()
  }, [refreshWeeklyTop])

  const value = useMemo<AppState>(
    () => ({
      ready,
      user,
      streams,
      weeklyTop,
      currentVideoId,
      isPlaying,
      login,
      logout,
      play,
      stop,
      setPlaying: setIsPlaying,
      recordStream,
      importTakeout,
      clearHistory,
      refreshWeeklyTop,
    }),
    [
      ready,
      user,
      streams,
      weeklyTop,
      currentVideoId,
      isPlaying,
      login,
      logout,
      play,
      stop,
      recordStream,
      importTakeout,
      clearHistory,
      refreshWeeklyTop,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
