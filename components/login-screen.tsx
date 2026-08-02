'use client'

import { Heart } from 'lucide-react'
import { useApp } from '@/lib/store'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}

export function LoginScreen() {
  const { login } = useApp()

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 size-96 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
          <Heart className="size-8 fill-current text-primary-foreground" />
        </div>

        <h1 className="font-display text-4xl font-bold tracking-tight text-balance">
          Borahae<span className="text-gold">.fm</span>
        </h1>
        <p className="mt-3 max-w-sm text-pretty leading-relaxed text-muted-foreground">
          The streaming tracker built for ARMY. Play BTS videos in-app, and every
          finished stream is counted toward your totals. 보라해.
        </p>

        <button
          onClick={login}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-foreground px-5 py-3.5 font-semibold text-background transition-transform hover:scale-[1.02] active:scale-100"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="mt-4 text-xs text-muted-foreground">
          Demo sign-in for now. Connect Supabase Auth to enable real Google login.
        </p>

        <div className="mt-10 grid w-full grid-cols-3 gap-3 text-center">
          {[
            { k: 'In-app', v: 'Player' },
            { k: 'Real', v: 'Tracking' },
            { k: 'ARMY', v: 'Only' },
          ].map((s) => (
            <div
              key={s.v}
              className="rounded-lg border border-border bg-card/50 px-2 py-3"
            >
              <p className="font-display text-sm font-bold text-gold">{s.k}</p>
              <p className="text-xs text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
