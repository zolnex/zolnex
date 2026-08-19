import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { classNames } from '../../lib/utils'

export function Header() {
  const { profile, signInWithGitHub, signOut, isDemo } = useAuth()
  const navigate = useNavigate()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    classNames(
      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
      isActive
        ? 'text-white bg-white/10'
        : 'text-slate-300 hover:text-white hover:bg-white/5',
    )

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 pr-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-white shadow-lg shadow-brand-500/30">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="text-lg font-extrabold tracking-tight text-white">
            zol<span className="text-brand-400">nex</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 sm:flex">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/browse" className={linkClass}>
            Browse
          </NavLink>
          {profile && (
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {isDemo && (
            <span className="hidden rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300 ring-1 ring-amber-500/30 sm:inline">
              Demo mode
            </span>
          )}

          {profile ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full bg-white/5 p-1 pr-3 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                <Avatar profile={profile} />
                <span className="hidden text-sm font-medium text-slate-200 sm:inline">
                  {profile.display_name ?? profile.username ?? 'Player'}
                </span>
              </Link>
              <button
                onClick={async () => {
                  await signOut()
                  navigate('/')
                }}
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white sm:block"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGitHub}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              <GithubIcon />
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
        <NavLink to="/" end className={linkClass}>
          Home
        </NavLink>
        <NavLink to="/browse" className={linkClass}>
          Browse
        </NavLink>
        {profile && (
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
        )}
        {profile && (
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
        )}
      </nav>
    </header>
  )
}

function Avatar({ profile }: { profile: { avatar_url: string | null; display_name: string | null; username: string | null } }) {
  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt=""
        className="h-8 w-8 rounded-full object-cover"
      />
    )
  }
  const initial = (profile.display_name ?? profile.username ?? 'P').charAt(0).toUpperCase()
  return (
    <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-purple-600 text-sm font-bold text-white">
      {initial}
    </span>
  )
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-1.8c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.7.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.6 18 4.9 18 4.9c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  )
}
