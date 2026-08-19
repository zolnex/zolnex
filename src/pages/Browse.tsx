import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GameCard } from '../components/games/GameCard'
import { fetchGames } from '../lib/games'
import { GAME_CATEGORIES } from '../types'
import type { GameCategory, PlayableGame } from '../types'

type CategoryFilter = GameCategory | 'All'

export function Browse() {
  const [params, setParams] = useSearchParams()
  const [games, setGames] = useState<PlayableGame[]>([])
  const [loading, setLoading] = useState(true)

  const category = (params.get('category') as CategoryFilter) || 'All'
  const search = params.get('q') || ''
  const sort = params.get('sort') || 'new'

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  useEffect(() => {
    setLoading(true)
    fetchGames({
      category: category === 'All' ? 'All' : category,
      search,
    })
      .then((data) => setGames(data))
      .finally(() => setLoading(false))
  }, [category, search])

  const sorted = useMemo(() => {
    const arr = [...games]
    if (sort === 'popular') arr.sort((a, b) => b.play_count - a.play_count)
    else if (sort === 'name')
      arr.sort((a, b) => a.title.localeCompare(b.title))
    else arr.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    return arr
  }, [games, sort])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Browse games</h1>
          <p className="mt-1 text-slate-400">
            {loading
              ? 'Loading…'
              : `${sorted.length} game${sorted.length === 1 ? '' : 's'} ready to play`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-slate-500"
            >
              <path d="M10 2a8 8 0 105.3 14l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setParam('q', e.target.value)}
              placeholder="Search games…"
              className="input pl-9 sm:w-64"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="input w-auto"
          >
            <option value="new">Newest</option>
            <option value="popular">Most played</option>
            <option value="name">A–Z</option>
          </select>
        </div>
      </div>

      {/* Category strip */}
      <div className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1">
        {(['All', ...GAME_CATEGORIES] as CategoryFilter[]).map((c) => (
          <button
            key={c}
            onClick={() => setParam('category', c === 'All' ? '' : c)}
            className={
              'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ' +
              (category === c
                ? 'bg-gradient-to-br from-brand-500 to-purple-600 text-white'
                : 'bg-white/5 text-slate-300 ring-1 ring-white/10 hover:bg-white/10')
            }
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video animate-pulse rounded-2xl bg-slate-800/50 ring-1 ring-white/10"
            />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 py-24 text-center">
          <div className="text-5xl">🕹️</div>
          <h3 className="mt-4 text-lg font-semibold text-white">No games found</h3>
          <p className="mt-1 text-sm text-slate-400">
            Try a different category or search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      )}
    </div>
  )
}
