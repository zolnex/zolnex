import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GameCard } from '../components/games/GameCard'
import { fetchFeatured } from '../lib/games'
import { GAME_CATEGORIES } from '../types'
import type { PlayableGame } from '../types'

export function Home() {
  const [featured, setFeatured] = useState<PlayableGame[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeatured(6)
      .then(setFeatured)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-medium text-brand-200 ring-1 ring-white/10">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Instant play · no downloads · no installs
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
            Play HTML5 games{' '}
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              instantly
            </span>
            , right in your browser.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">
            A home for indie developers and players. Browse, click, and play —
            no accounts required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/browse" className="btn-primary">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start playing
            </Link>
            <Link to="/upload" className="btn-ghost">
              Publish your game
            </Link>
          </div>

          <div className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4 text-center">
            <Stat value="100%" label="Browser-based" />
            <Stat value="0" label="Downloads needed" />
            <Stat value="∞" label="Indie games" />
          </div>
        </div>
      </section>

      {/* Featured games */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured games</h2>
            <p className="text-sm text-slate-400">
              Hand-picked titles to jump into right now.
            </p>
          </div>
          <Link
            to="/browse"
            className="text-sm font-medium text-brand-400 hover:text-brand-300"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <h2 className="mb-6 text-2xl font-bold text-white">Browse by category</h2>
        <div className="flex flex-wrap gap-2">
          {GAME_CATEGORIES.map((c) => (
            <Link
              key={c}
              to={`/browse?category=${encodeURIComponent(c)}`}
              className="rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 ring-1 ring-white/10 transition hover:bg-brand-500/20 hover:text-white"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* Developer CTA */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 ring-1 ring-white/10 sm:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-500/20 blur-2xl" />
          <div className="relative max-w-xl">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Are you a game developer?
            </h2>
            <p className="mt-3 text-slate-400">
              Sign in with GitHub, drop your HTML5 game as a ZIP, and reach
              players in seconds. We handle hosting, analytics, and player
              counts — you focus on building.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/upload" className="btn-primary">
                Upload a game
              </Link>
              <Link to="/dashboard" className="btn-ghost">
                Open dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-4 ring-1 ring-white/10">
      <div className="text-2xl font-extrabold text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{label}</div>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl bg-slate-800/40 ring-1 ring-white/10"
        >
          <div className="relative aspect-video overflow-hidden bg-slate-800">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 rounded bg-slate-700/60" />
            <div className="h-3 w-full rounded bg-slate-700/40" />
            <div className="h-3 w-1/2 rounded bg-slate-700/40" />
          </div>
        </div>
      ))}
    </div>
  )
}
