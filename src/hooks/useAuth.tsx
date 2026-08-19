import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { MOCK_DEVELOPER } from '../lib/mockData'
import type { UserProfile, UserRole } from '../types'

// ---------------------------------------------------------------------------
// Auth context
// ---------------------------------------------------------------------------

interface AuthContextValue {
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  isDemo: boolean
  /** Sign in with GitHub OAuth. No-op (with a toast) in demo mode. */
  signInWithGitHub: () => Promise<void>
  signOut: () => Promise<void>
  role: UserRole
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const isDemo = !isSupabaseConfigured

  useEffect(() => {
    if (!supabase) {
      // Demo mode: no real session, but expose a pretend developer so the
      // dashboard / upload pages are explorable.
      setProfile(MOCK_DEVELOPER)
      setLoading(false)
      return
    }

    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      loadProfile(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_e, newSession) => {
      setSession(newSession)
      loadProfile(newSession)
    })

    function loadProfile(s: Session | null) {
      if (!s?.user) {
        setProfile(null)
        return
      }
      supabase!
        .from('users')
        .select('*')
        .eq('id', s.user.id)
        .maybeSingle()
        .then(({ data }) => setProfile(data as UserProfile | null))
    }

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      isDemo,
      role: profile?.role ?? 'player',
      async signInWithGitHub() {
        if (!supabase) {
          alert(
            'Demo mode active.\n\nTo enable real GitHub sign-in, add your Supabase URL and anon key (see README → Environment Variables).',
          )
          return
        }
        await supabase.auth.signInWithOAuth({ provider: 'github' })
      },
      async signOut() {
        if (supabase) await supabase.auth.signOut()
        setSession(null)
        setProfile(MOCK_DEVELOPER)
      },
    }),
    [session, profile, loading, isDemo],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
