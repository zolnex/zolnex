import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { classNames } from '../../lib/utils'
import { Logo } from '../brand/Logo'

export function Header() {
  const { profile, signInWithGitHub, signOut, isDemo } = useAuth()
  const navigate = useNavigate()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    classNames(
      'px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition',
      isActive ? 'text-acid' : 'text-mute hover:text-paper',
    )

  return (
    <header className="sticky top-0 z-40 border-b-2 border-line bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center gap-2 px-4 sm:px-6">
        <Logo />

        <nav className="ml-5 hidden items-center gap-1 sm:flex">
          <NavLink to="/" end className={linkClass}>
            Floor
          </NavLink>
          <NavLink to="/browse" className={linkClass}>
            Browse
          </NavLink>
          {profile && (
            <NavLink to="/dashboard" className={linkClass}>
              Desk
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {isDemo && (
            <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-acid sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-blink bg-acid" />
              Demo cabinet
            </span>
          )}

          {profile ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 border-2 border-line bg-panel py-1 pl-1 pr-3 transition hover:border-paper/30"
              >
                <Avatar profile={profile} />
                <span className="hidden font-mono text-[11px] uppercase tracking-[0.12em] text-paper sm:inline">
                  {profile.display_name ?? profile.username ?? 'Player'}
                </span>
              </Link>
              <button
                onClick={async () => {
                  await signOut()
                  navigate('/')
                }}
                className="hidden px-2 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-mute transition hover:text-paper sm:block"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button onClick={signInWithGitHub} className="btn-ghost !py-2">
              <GithubIcon />
              Sign in
            </button>
          )}
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-line px-4 py-2 sm:hidden">
        <NavLink to="/" end className={linkClass}>
          Floor
        </NavLink>
        <NavLink to="/browse" className={linkClass}>
          Browse
        </NavLink>
        {profile && (
          <NavLink to="/dashboard" className={linkClass}>
            Desk
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

function Avatar({
  profile,
}: {
  profile: {
    avatar_url: string | null
    display_name: string | null
    username: string | null
  }
}) {
  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt=""
        className="h-7 w-7 object-cover"
      />
    )
  }
  const initial = (profile.display_name ?? profile.username ?? 'P')
    .charAt(0)
    .toUpperCase()
  return (
    <span className="grid h-7 w-7 place-items-center bg-ember font-display text-sm font-extrabold text-ink">
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
