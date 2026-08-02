'use client'

import { useRef, useState } from 'react'
import { CheckCircle2, FileJson, Info, Loader2, Upload } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { TRACKED_IDS } from '@/lib/catalog'
import { useApp } from '@/lib/store'

type ParseResult = {
  imported: number
  matchedBts: number
  totalRows: number
}

// Extract an 11-char YouTube video ID from a titleUrl like
// https://www.youtube.com/watch?v=VIDEOID
function extractId(url: unknown): string | null {
  if (typeof url !== 'string') return null
  const m = url.match(/[?&]v=([\w-]{11})/)
  return m ? m[1] : null
}

function parseTakeout(json: unknown): { videoId: string; ts: number }[] {
  if (!Array.isArray(json)) return []
  const rows: { videoId: string; ts: number }[] = []
  for (const entry of json) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    const videoId = extractId(e.titleUrl)
    if (!videoId) continue
    const ts = typeof e.time === 'string' ? Date.parse(e.time) : NaN
    rows.push({ videoId, ts: Number.isNaN(ts) ? Date.now() : ts })
  }
  return rows
}

function ImportContent() {
  const { importTakeout } = useApp()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'parsing' | 'done' | 'error'>(
    'idle',
  )
  const [result, setResult] = useState<ParseResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setStatus('parsing')
    setError(null)
    setResult(null)
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const rows = parseTakeout(json)
      const matchedBts = rows.filter((r) => TRACKED_IDS.has(r.videoId)).length
      const imported = importTakeout(rows)
      setResult({ imported, matchedBts, totalRows: rows.length })
      setStatus('done')
    } catch {
      setError(
        'Could not read that file. Make sure it is the watch-history.json from Google Takeout.',
      )
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Import History
        </h1>
        <p className="mt-1 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Bring in your old YouTube watch history from Google Takeout. We only
          keep the videos that match the BTS catalog — everything else is
          ignored, and parsing happens right in your browser.
        </p>
      </header>

      {/* Dropzone */}
      <button
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card/40 px-6 py-14 text-center transition-colors hover:border-primary/60 hover:bg-card"
      >
        {status === 'parsing' ? (
          <Loader2 className="size-10 animate-spin text-primary" />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/15">
            <Upload className="size-6 text-primary" />
          </span>
        )}
        <div>
          <p className="font-display text-lg font-semibold">
            {status === 'parsing' ? 'Parsing your history…' : 'Upload watch-history.json'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Click to choose your Google Takeout JSON file
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
            e.target.value = ''
          }}
        />
      </button>

      {status === 'done' && result && (
        <div className="flex items-start gap-3 rounded-xl border border-primary/40 bg-card p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-display font-semibold">Import complete</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Found{' '}
              <span className="font-semibold text-foreground">
                {result.totalRows.toLocaleString()}
              </span>{' '}
              watched videos,{' '}
              <span className="font-semibold text-gold">
                {result.imported.toLocaleString()}
              </span>{' '}
              matched the BTS catalog and were added to your history.
            </p>
            <a
              href="/history"
              className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              View timeline
            </a>
          </div>
        </div>
      )}

      {status === 'error' && error && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-foreground">
          {error}
        </div>
      )}

      {/* How to */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <Info className="size-4 text-gold" />
          <h2 className="font-display font-semibold">
            How to get your Takeout file
          </h2>
        </div>
        <ol className="flex flex-col gap-2 text-sm text-muted-foreground">
          {[
            'Go to takeout.google.com and deselect all products.',
            'Select only "YouTube and YouTube Music", then under content options choose "history".',
            'Export and download the archive, then unzip it.',
            'Find history/watch-history.json (choose JSON format in Takeout, not HTML) and upload it here.',
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-xs font-bold text-foreground">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
          <FileJson className="size-4 shrink-0" />
          Your file never leaves your device — it&apos;s parsed locally in your
          browser.
        </div>
      </section>
    </div>
  )
}

export default function ImportPage() {
  return (
    <AppShell>
      <ImportContent />
    </AppShell>
  )
}
