import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GamePlayer } from '../components/games/GamePlayer'
import { GameCard } from '../components/games/GameCard'
import { fetchGameBySlug, fetchGames, formatPlayCount, incrementPlayCount } from '../lib/games'
import { relativeTime } from '../lib/utils'
import type { PlayableGame } from '../types'

export function GamePage() {
  const { slug } = useParams<{ slug: string }>()
  const [game, setGame] = useState<PlayableGame | null>(null)
  const [related, setRelated] = useState<PlayableGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(null)
    fetchGameBySlug(slug)
      .then((g) => {
        if (!g) {
          setError('Game not found.')
          return
        }
        setGame(g)
        incrementPlayCount(g.id)
        // best-effort related games (same category, excluding current)
        fetchGames({ category: g.category ?? 'All', limit: 5 }).then((rows) =>
          setRelated(rows.filter((r) => r.id !== g.id).slice(0, 4)),
        )
      })
      .catch(() => setError('Something went wrong loading this game.'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="aspect-video w-full max-w-4xl animate-pulse rounded-2xl bg-slate-800/60" />
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="text-5xl">👻</div>
        <h1 className="mt-4 text-2xl font-bold text-white">{error ?? 'Game not found'}</h1>
        <Link to="/browse" className="btn-primary mt-6">
          Back to browse
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-4 text-sm text-slate-400">
        <Link to="/" className="hover:text-white">
          Home
        </Link>{' '}
        /{' '}
        <Link to="/browse" className="hover:text-white">
          Browse
        </Link>{' '}
        / <span className="text-slate-200">{game.title}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <GamePlayer src={game.playUrl} title={game.title} />

          <div className="mt-6">
            <h1 className="text-3xl font-bold text-white">{game.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
              {game.category && (
                <Link
                  to={`/browse?category=${encodeURIComponent(game.category)}`}
                  className="badge bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30"
                >
                  {game.category}
                </Link>
              )}
              <span className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {formatPlayCount(game.play_count)} plays
              </span>
              <span>· Added {relativeTime(game.created_at)}</span>
            </div>

            {game.description && (
              <p className="mt-4 max-w-2xl leading-relaxed text-slate-300">
                {game.description}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-semibold text-white">Developer</h3>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-purple-600 font-bold text-white">
                {(game.developer?.display_name ?? game.developer?.username ?? '?').charAt(0)}
              </span>
              <div>
                <div className="font-medium text-white">
                  {game.developer?.display_name ??
                    game.developer?.username ??
                    'Unknown developer'}
                </div>
                <div className="text-xs text-slate-400">Game studio</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-white">Share</h3>
            <div className="mt-3 flex gap-2">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href)
                  } catch {
                    /* ignore */
                  }
                }}
                className="btn-ghost w-full text-xs"
              >
                Copy link
              </button>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 text-xl font-bold text-white">More like this</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
