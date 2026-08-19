import { isSupabaseConfigured } from '../lib/supabase'

/**
 * Slim banner shown only when the app is running in demo mode (no Supabase
 * credentials baked in). Helps the user understand why features like
 * sign-in/upload don't persist, and how to wire up the real backend.
 */
export function DemoBanner() {
  if (isSupabaseConfigured) return null
  return (
    <div className="border-b-2 border-line bg-raised px-4 py-2.5 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
      <span className="mr-2 inline-block h-1.5 w-1.5 animate-blink bg-acid align-middle" />
      Demo cabinet — built-in games, local uploads.{' '}
      <a
        href="https://github.com/zolnex/zolnex.github.io#connect-supabase-optional-for-production"
        target="_blank"
        rel="noreferrer"
        className="text-acid underline decoration-acid/40 underline-offset-4 hover:text-paper"
      >
        Hook up Supabase to persist
      </a>
    </div>
  )
}
