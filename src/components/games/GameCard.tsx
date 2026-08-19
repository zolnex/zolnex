import { Link } from 'react-router-dom'
import type { PlayableGame } from '../../types'
import { formatPlayCount } from '../../lib/games'
import { classNames } from '../../lib/utils'

export function GameCard({
  game,
  featured = false,
}: {
  game: PlayableGame
  featured?: boolean
}) {
  return (
    <Link
      to={`/game/${game.slug}`}
      className={classNames(
        'group block h-full',
        featured && 'sm:col-span-2 sm:row-span-2',
      )}
    >
      <article className="flex h-full flex-col bg-paper p-[5px] shadow-stamp transition group-hover:-translate-x-px group-hover:-translate-y-px group-hover:shadow-stamp-ember">
        <div
          className={classNames(
            'relative overflow-hidden bg-ink',
            featured ? 'aspect-[16/10] sm:aspect-auto sm:min-h-[280px] sm:flex-1' : 'aspect-video',
          )}
        >
          {game.coverUrl ? (
            <img
              src={game.coverUrl}
              alt={game.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-raised font-display text-3xl text-mute">
              {game.title.charAt(0)}
            </div>
          )}
          {game.category && (
            <span className="stamp absolute left-2 top-2">{game.category}</span>
          )}
          <span className="absolute bottom-2 right-2 translate-y-1 bg-ember px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
            Play
          </span>
        </div>
        <div className={classNames('bg-paper', featured ? 'p-4 sm:p-5' : 'px-3 py-3')}>
          <h3
            className={classNames(
              'font-display font-extrabold leading-tight tracking-tight text-ink',
              featured ? 'text-2xl sm:text-3xl' : 'text-lg',
            )}
          >
            {game.title}
          </h3>
          {featured && game.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/70">
              {game.description}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/55">
            <span className="truncate">
              {game.developer?.display_name ??
                game.developer?.username ??
                'Unknown'}
            </span>
            <span>{formatPlayCount(game.play_count)} plays</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
