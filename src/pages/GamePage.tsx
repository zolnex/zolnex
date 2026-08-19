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
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(null)
    fetchGameBySlug(slug)
      .then((g) => {
        if (!g) {
          setError('Cabinet not found.')
          return
        }
        setGame(g)
        incrementPlayCount(g.id)
        fetchGames({ category: g.category ?? 'All', limit: 5 }).then((rows) =>
          setRelated(rows.filter((r) => r.id !== g.id).slice(0, 4)),
        )
      })
      .catch(() => setError('Something went wrong loading this cabinet.'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="aspect-video w-full max-w-4xl animate-pulse border-2 border-line bg-panel" />
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="kicker">404</p>
        <h1 className="display mt-3 text-3xl">{error ?? 'Cabinet not found'}</h1>
        <Link to="/browse" className="btn-primary mt-6">
          Back to the floor
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
        <Link to="/" className="hover:text-paper">
          Floor
        </Link>
        <span className="mx-2 text-line">/</span>
        <Link to="/browse" className="hover:text-paper">
          Browse
        </Link>
        <span className="mx-2 text-line">/</span>
        <span className="text-paper">{game.title}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <GamePlayer src={game.playUrl} title={game.title} />

          <div className="mt-7">
            <h1 className="display text-4xl">{game.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-mute">
              {game.category && (
                <Link
                  to={`/browse?category=${encodeURIComponent(game.category)}`}
                  className="badge bg-ember text-ink"
                >
                  {game.category}
                </Link>
              )}
              <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
                {formatPlayCount(game.play_count)} plays
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
                Added {relativeTime(game.created_at)}
              </span>
            </div>

            {game.description && (
              <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-paper/85">
                {game.description}
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card">
            <h3 className="kicker">Studio</h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center bg-ember font-display text-lg font-extrabold text-ink">
                {(game.developer?.display_name ?? game.developer?.username ?? '?').charAt(0)}
              </span>
              <div>
                <div className="font-display text-lg font-extrabold text-paper">
                  {game.developer?.display_name ??
                    game.developer?.username ??
                    'Unknown studio'}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
                  Independent
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="kicker">Pass it on</h3>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1800)
                } catch {
                  /* ignore */
                }
              }}
              className="btn-ghost mt-4 w-full text-xs"
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <p className="kicker">Same aisle</p>
          <h2 className="display mt-2 mb-6 text-2xl">More like this</h2>
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
