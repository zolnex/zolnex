import { Link } from 'react-router-dom'
import type { PlayableGame } from '../../types'
import { formatPlayCount } from '../../lib/games'

export function GameCard({ game }: { game: PlayableGame }) {
  return (
    <Link
      to={`/game/${game.slug}`}
      className="group block overflow-hidden rounded-2xl bg-slate-800/60 ring-1 ring-white/10 transition hover:-translate-y-1 hover:ring-brand-500/50"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        {game.coverUrl ? (
          <img
            src={game.coverUrl}
            alt={game.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-slate-800 to-slate-900 text-3xl">
            🎮
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        {game.category && (
          <span className="absolute left-2 top-2 rounded-md bg-slate-950/70 px-2 py-1 text-xs font-medium text-brand-200 backdrop-blur">
            {game.category}
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 translate-y-2 bg-brand-600 py-2 text-center text-sm font-semibold text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
          ▶ Play now
        </span>
      </div>
      <div className="p-4">
        <h3 className="truncate font-bold text-white">{game.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-400">
          {game.description ?? 'No description.'}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate">
            {game.developer?.display_name ??
              game.developer?.username ??
              'Unknown'}
          </span>
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
              <path d="M8 5v14l11-7z" />
            </svg>
            {formatPlayCount(game.play_count)}
          </span>
        </div>
      </div>
    </Link>
  )
}
