import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/15">
        <AlertTriangle className="size-7 text-destructive" />
      </span>
      <h1 className="mt-6 font-display text-2xl font-bold">
        Sign-in didn&apos;t complete
      </h1>
      <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
        Something went wrong while signing you in with Google. Please head back
        and try again.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground"
      >
        Back to Borahae.fm
      </Link>
    </main>
  )
}
