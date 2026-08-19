import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="text-lg font-extrabold text-white">
              Insta<span className="text-brand-400">Play</span>
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-slate-400">
            Play HTML5 games instantly in your browser. No downloads, no
            installs — just hit play.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>
              <Link to="/browse" className="hover:text-white">
                Browse games
              </Link>
            </li>
            <li>
              <Link to="/browse?category=Arcade" className="hover:text-white">
                Arcade
              </Link>
            </li>
            <li>
              <Link to="/browse?category=Puzzle" className="hover:text-white">
                Puzzle
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">For developers</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>
              <Link to="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/upload" className="hover:text-white">
                Upload a game
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} zolnex · Built with React, Vite &
        Supabase · Hosted on GitHub Pages
      </div>
    </footer>
  )
}
