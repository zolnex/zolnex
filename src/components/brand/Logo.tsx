import { Link } from 'react-router-dom'
import { classNames } from '../../lib/utils'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5 pr-1">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center bg-ember text-ink shadow-stamp transition group-hover:-translate-x-px group-hover:-translate-y-px group-hover:shadow-stamp-acid"
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M4 4h16v3.2H10.4L20 20H4v-3.2h9.6L4 4z" />
        </svg>
      </span>
      <span
        className={classNames(
          'font-display text-xl font-extrabold tracking-tight text-paper',
          compact && 'sr-only sm:not-sr-only',
        )}
      >
        zolnex
      </span>
    </Link>
  )
}
