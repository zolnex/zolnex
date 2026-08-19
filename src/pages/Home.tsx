import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { GameCard } from '../components/games/GameCard'
import { fetchFeatured, formatPlayCount } from '../lib/games'
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

  const pick = featured[0]
  const rest = featured.slice(1)
  const totalPlays = featured.reduce((s, g) => s + g.play_count, 0)

  return (
    <div className="animate-fade-in">
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-10 sm:px-6 sm:pt-16">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="kicker">
              <span className="mr-2 inline-block h-1.5 w-1.5 animate-blink bg-ember align-middle" />
              Open late · HTML5 · no downloads
            </p>
            <h1 className="display mt-4 max-w-[14ch] text-5xl leading-[0.92] sm:text-7xl">
              Tonight the arcade lives in your tab.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-mute sm:text-lg">
              Games from small studios, played where you already are. Click a
              cabinet. No installer, no account, no storefront queue.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/browse" className="btn-primary">
                Browse the floor
              </Link>
              <Link to="/upload" className="btn-ghost">
                Drop a ZIP
              </Link>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
              <div>
                <dt className="sr-only">Plays</dt>
                <dd>
                  <span className="text-paper">
                    {loading ? '—' : formatPlayCount(totalPlays)}
                  </span>{' '}
                  plays on the floor
                </dd>
              </div>
              <div>
                <dt className="sr-only">Cabinets</dt>
                <dd>
                  <span className="text-paper">
                    {loading ? '—' : featured.length}
                  </span>{' '}
                  cabinets warm
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-5">
            {loading || !pick ? (
              <div className="aspect-[4/5] animate-pulse bg-panel sm:aspect-[5/4]" />
            ) : (
              <Link to={`/game/${pick.slug}`} className="group block">
                <div className="relative bg-paper p-2 shadow-stamp transition group-hover:-translate-x-px group-hover:-translate-y-px group-hover:shadow-stamp-ember">
                  <div className="relative aspect-[5/4] overflow-hidden bg-ink">
                    {pick.coverUrl && (
                      <img
                        src={pick.coverUrl}
                        alt=""
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                    )}
                    <span className="absolute left-3 top-3 bg-acid px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink">
                      Now playing
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-4 bg-paper px-3 py-3">
                    <div>
                      <div className="font-display text-2xl font-extrabold leading-none text-ink">
                        {pick.title}
                      </div>
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/55">
                        {pick.developer?.display_name} · {pick.category}
                      </div>
                    </div>
                    <span className="shrink-0 bg-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-paper">
                      Play →
                    </span>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      <CategoryTicker />

      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="kicker">On the floor</p>
            <h2 className="display mt-2 text-3xl sm:text-4xl">Tonight’s cabinets</h2>
          </div>
          <Link
            to="/browse"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute hover:text-paper"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.length > 0 ? (
              <>
                <GameCard key={rest[0].id} game={rest[0]} featured />
                {rest.slice(1).map((g) => (
                  <GameCard key={g.id} game={g} />
                ))}
              </>
            ) : (
              featured.map((g) => <GameCard key={g.id} game={g} />)
            )}
          </div>
        )}
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <p className="kicker">How the floor works</p>
        <h2 className="display mt-2 max-w-xl text-3xl sm:text-4xl">
          Three steps. Then you’re in.
        </h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          <Step n="01" title="Pick a cabinet">
            Browse by mood — arcade, puzzle, something meaner. Every title
            runs in the page.
          </Step>
          <Step n="02" title="Play in the tab">
            Fullscreen if you want it. No client, no launcher, no “add to
            library.”
          </Step>
          <Step n="03" title="Or ship a ZIP">
            Sign in with GitHub, drop an <code className="text-acid">index.html</code>{' '}
            archive, and it goes on the floor.
          </Step>
        </ol>
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden border-2 border-line bg-raised p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-8 top-0 font-display text-[9rem] leading-none text-paper/[0.04]">
            ZIP
          </div>
          <p className="kicker">For developers</p>
          <h2 className="display relative mt-3 max-w-xl text-3xl sm:text-4xl">
            Ship a ZIP. We put it on the floor.
          </h2>
          <p className="relative mt-4 max-w-lg text-mute">
            Hosting, play counts, and a public cabinet. You keep the build.
            Players hit play the same minute you upload.
          </p>
          <div className="relative mt-7 flex flex-wrap gap-3">
            <Link to="/upload" className="btn-primary">
              Upload a game
            </Link>
            <Link to="/dashboard" className="btn-ghost">
              Open the desk
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function CategoryTicker() {
  const items = [...GAME_CATEGORIES, ...GAME_CATEGORIES]
  return (
    <div className="mt-14 overflow-hidden border-y-2 border-line bg-raised">
      <div className="flex w-max animate-marquee gap-0 hover:[animation-play-state:paused]">
        {items.map((c, i) => (
          <Link
            key={`${c}-${i}`}
            to={`/browse?category=${encodeURIComponent(c)}`}
            className="shrink-0 border-r-2 border-line px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mute transition hover:bg-ember hover:text-ink"
          >
            {c}
          </Link>
        ))}
      </div>
    </div>
  )
}

function Step({
  n,
  title,
  children,
}: {
  n: string
  title: string
  children: ReactNode
}) {
  return (
    <li className="card">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember">{n}</div>
      <h3 className="mt-3 font-display text-xl font-extrabold text-paper">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-mute">{children}</p>
    </li>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={
            'overflow-hidden bg-paper p-[5px] ' +
            (i === 0 ? 'sm:col-span-2 sm:row-span-2' : '')
          }
        >
          <div className="relative aspect-video overflow-hidden bg-ink/10">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-ink/10 to-transparent" />
          </div>
          <div className="space-y-2 p-3">
            <div className="h-5 w-2/3 bg-ink/10" />
            <div className="h-3 w-1/2 bg-ink/10" />
          </div>
        </div>
      ))}
    </div>
  )
}
