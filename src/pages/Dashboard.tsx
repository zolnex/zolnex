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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-acid" />
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
          <p className="kicker">Developer desk</p>
          <h1 className="display mt-2 text-4xl">
            {profile?.display_name ?? profile?.username ?? 'dev'}
          </h1>
          <p className="mt-2 text-mute">Cabinets you put on the floor.</p>
        </div>
        <Link to="/upload" className="btn-primary">
          + New cabinet
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Cabinets" value={String(games.length)} hint={`${approved} live`} />
        <StatCard label="Plays" value={formatPlayCount(totalPlays)} hint="all time" />
        <StatCard
          label="Storage"
          value={`${storageUsed} MB`}
          hint={`of ${storageMax} MB`}
        />
        <StatCard
          label="Slots"
          value={`${games.length} / ${quota?.max_games ?? 10}`}
          hint="published"
        />
      </div>

      <div className="card mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="kicker">Storage quota</span>
          <span className="font-mono text-[11px] text-mute">
            {storageUsed} / {storageMax} MB
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden bg-ink">
          <div
            className="h-full bg-ember transition-all"
            style={{ width: `${storagePct}%` }}
          />
        </div>
      </div>

      <div className="overflow-hidden border-2 border-line bg-panel">
        <div className="border-b-2 border-line px-5 py-4">
          <h2 className="font-display text-xl font-extrabold text-paper">Your games</h2>
        </div>
        {games.length === 0 ? (
          <div className="grid place-items-center px-5 py-16 text-center">
            <p className="kicker">Empty desk</p>
            <h3 className="display mt-3 text-2xl">No cabinets yet</h3>
            <p className="mt-2 text-sm text-mute">
              Upload an HTML5 ZIP to put something on the floor.
            </p>
            <Link to="/upload" className="btn-primary mt-5">
              Upload a game
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
                <tr>
                  <th className="px-5 py-3">Game</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Plays</th>
                  <th className="px-5 py-3">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {games.map((g) => (
                  <tr key={g.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-3">
                      <Link
                        to={`/game/${g.slug}`}
                        className="font-display font-bold text-paper hover:text-ember"
                      >
                        {g.title}
                      </Link>
                      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                        {g.category ?? 'Uncategorized'}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={g.status} />
                    </td>
                    <td className="px-5 py-3 font-mono text-paper/80">
                      {formatPlayCount(g.play_count)}
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-mute">
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
    <div className="card !p-4">
      <div className="kicker">{label}</div>
      <div className="mt-2 font-display text-2xl font-extrabold text-paper">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
        {hint}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: PlayableGame['status'] }) {
  const map = {
    approved: 'bg-acid text-ink',
    pending: 'bg-paper text-ink',
    rejected: 'bg-ember text-ink',
  }
  return (
    <span className={`badge ${map[status]}`}>
      {status === 'approved' ? 'Live' : status === 'pending' ? 'In review' : 'Rejected'}
    </span>
  )
}
