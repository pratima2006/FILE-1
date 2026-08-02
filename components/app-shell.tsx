'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Heart,
  History,
  Home,
  LogOut,
  Upload,
  Users,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { LoginScreen } from './login-screen'
import { YouTubePlayer } from './youtube-player'

const NAV = [
  { href: '/', label: 'Today', icon: Home },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
  { href: '/artists', label: 'Artists', icon: Users },
  { href: '/history', label: 'History', icon: History },
  { href: '/import', label: 'Import', icon: Upload },
]

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary">
        <Heart className="size-4 fill-current text-primary-foreground" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        Borahae<span className="text-gold">.fm</span>
      </span>
    </Link>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, user, logout, currentVideoId } = useApp()
  const pathname = usePathname()

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Heart className="size-8 animate-pulse fill-current text-primary" />
      </div>
    )
  }

  if (!user) return <LoginScreen />

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-svh md:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-border bg-card/40 px-4 py-6 md:flex">
        <div className="px-2">
          <Logo />
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold font-display text-xs font-bold text-gold-foreground">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:hidden">
          <Logo />
          <button
            onClick={logout}
            className="rounded-md p-2 text-muted-foreground hover:text-foreground"
            aria-label="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </header>

        <main
          className={`flex-1 px-4 py-6 sm:px-6 lg:px-8 ${
            currentVideoId ? 'pb-72 md:pb-80' : 'pb-24 md:pb-10'
          }`}
        >
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-background/95 backdrop-blur md:hidden">
        {NAV.map((item) => {
          const active =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <YouTubePlayer />
    </div>
  )
}
