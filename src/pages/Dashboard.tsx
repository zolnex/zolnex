import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  fetchDeveloperQuota,
  fetchGamesByDeveloper,
  formatPlayCount,
} from '../lib/games'
import type { PlayableGame } from '../types'
import { relativeTime } from '../lib/utils'

export function Dashboard() {
  const { profile } = useAuth()
  const [games, setGames] = useState<PlayableGame[]>([])
  const [quota, setQuota] = useState<{
    max_games: number
    max_storage_mb: number
    used_storage_mb: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    Promise.all([
      fetchGamesByDeveloper(profile.id),
      fetchDeveloperQuota(profile.id),
    ])
      .then(([g, q]) => {
        setGames(g)
        setQuota(q)
      })
      .finally(() => setLoading(false))
  }, [profile])

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-brand-400" />
      </div>
    )
  }

  const totalPlays = games.reduce((s, g) => s + g.play_count, 0)
  const approved = games.filter((g) => g.status === 'approved').length
  const storageUsed = quota?.used_storage_mb ?? 73
  const storageMax = quota?.max_storage_mb ?? 500
  const storagePct = Math.min(100, (storageUsed / storageMax) * 100)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-slate-400">
            Welcome back, {profile?.display_name ?? profile?.username ?? 'dev'}.
          </p>
        </div>
        <Link to="/upload" className="btn-primary">
          + Upload new game
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total games" value={String(games.length)} hint={`${approved} live`} />
        <StatCard label="Total plays" value={formatPlayCount(totalPlays)} hint="all time" />
        <StatCard
          label="Storage used"
          value={`${storageUsed} MB`}
          hint={`of ${storageMax} MB`}
        />
        <StatCard
          label="Quota slots"
          value={`${games.length} / ${quota?.max_games ?? 10}`}
          hint="games published"
        />
      </div>

      {/* Storage bar */}
      <div className="card mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-white">Storage quota</span>
          <span className="text-slate-400">
            {storageUsed} / {storageMax} MB
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all"
            style={{ width: `${storagePct}%` }}
          />
        </div>
      </div>

      {/* Games table */}
      <div className="overflow-hidden rounded-2xl bg-slate-800/60 ring-1 ring-white/10">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="font-semibold text-white">Your games</h2>
        </div>
        {games.length === 0 ? (
          <div className="grid place-items-center px-5 py-16 text-center">
            <div className="text-4xl">📦</div>
            <h3 className="mt-3 font-semibold text-white">No games yet</h3>
            <p className="mt-1 text-sm text-slate-400">
              Upload your first HTML5 game to get started.
            </p>
            <Link to="/upload" className="btn-primary mt-5">
              Upload a game
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Game</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Plays</th>
                  <th className="px-5 py-3">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {games.map((g) => (
                  <tr key={g.id} className="hover:bg-white/5">
                    <td className="px-5 py-3">
                      <Link
                        to={`/game/${g.slug}`}
                        className="font-medium text-white hover:text-brand-300"
                      >
                        {g.title}
                      </Link>
                      <div className="text-xs text-slate-500">
                        {g.category ?? 'Uncategorized'}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={g.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-300">
                      {formatPlayCount(g.play_count)}
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {relativeTime(g.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{hint}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: PlayableGame['status'] }) {
  const map = {
    approved: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
    pending: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
    rejected: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  }
  return (
    <span className={`badge ring-1 ${map[status]}`}>
      {status === 'approved'
        ? 'Live'
        : status === 'pending'
          ? 'In review'
          : 'Rejected'}
    </span>
  )
}
