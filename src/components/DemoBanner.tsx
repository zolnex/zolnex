import { isSupabaseConfigured } from '../lib/supabase'

/**
 * Slim banner shown only when the app is running in demo mode (no Supabase
 * credentials baked in). Helps the user understand why features like
 * sign-in/upload don't persist, and how to wire up the real backend.
 */
export function DemoBanner() {
  if (isSupabaseConfigured) return null
  return (
    <div className="bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-200 ring-1 ring-inset ring-amber-500/20">
      Demo mode — browsing works with built-in sample games. Add your Supabase
      credentials to enable sign-in, uploads & persistence.{' '}
      <a
        href="https://github.com/zolnex/zolnex#setup"
        target="_blank"
        rel="noreferrer"
        className="font-semibold underline underline-offset-2"
      >
        Setup guide
      </a>
    </div>
  )
}
