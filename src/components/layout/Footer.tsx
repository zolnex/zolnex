import { Link } from 'react-router-dom'
import { Logo } from '../brand/Logo'

export function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-line bg-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-6">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-mute">
            An HTML5 arcade that lives in the tab. Small studios drop a ZIP;
            players click in. No launchers, no installers, no waiting on a
            storefront review to take a turn.
          </p>
        </div>

        <div className="md:col-span-3">
          <h4 className="kicker">On the floor</h4>
          <ul className="mt-3 space-y-2 text-sm text-mute">
            <li>
              <Link to="/browse" className="hover:text-paper">
                All cabinets
              </Link>
            </li>
            <li>
              <Link to="/browse?category=Arcade" className="hover:text-paper">
                Arcade
              </Link>
            </li>
            <li>
              <Link to="/browse?category=Puzzle" className="hover:text-paper">
                Puzzle
              </Link>
            </li>
            <li>
              <Link to="/browse?sort=popular" className="hover:text-paper">
                Most played
              </Link>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="kicker">For makers</h4>
          <ul className="mt-3 space-y-2 text-sm text-mute">
            <li>
              <Link to="/dashboard" className="hover:text-paper">
                Developer desk
              </Link>
            </li>
            <li>
              <Link to="/upload" className="hover:text-paper">
                Drop a ZIP
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/zolnex/zolnex.github.io"
                target="_blank"
                rel="noreferrer"
                className="hover:text-paper"
              >
                Source
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t-2 border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 font-mono text-[11px] uppercase tracking-[0.16em] text-mute sm:px-6">
          <span>© {new Date().getFullYear()} zolnex</span>
          <span>Browser cabinets · GitHub Pages</span>
        </div>
      </div>
    </footer>
  )
}
