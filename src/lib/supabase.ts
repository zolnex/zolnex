import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------
// The URL + anon key are injected at BUILD time by Vite (see .env or the
// GitHub Actions workflow). The anon key is designed to be public; Row Level
// Security protects the data, not the key.
//
// If the credentials are absent (e.g. a fresh checkout or a demo build), we
// leave the client as `null` and the rest of the app falls back to a local
// mock-data "demo mode" so the UI is still fully explorable.
// ---------------------------------------------------------------------------

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined

/** True when both required Supabase credentials look valid. */
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    /^https?:\/\/.+\.supabase\.(co|in)$/.test(SUPABASE_URL) &&
    !SUPABASE_ANON_KEY.includes('your-anon-key'),
)

export const STORAGE_BUCKET = 'game-files'

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/** Public read URL for an object path inside the game-files bucket. */
export function publicObjectUrl(path: string): string {
  if (!SUPABASE_URL) return ''
  return `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`
}
