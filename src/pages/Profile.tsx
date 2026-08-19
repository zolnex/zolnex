import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export function Profile() {
  const { profile, isDemo } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [username, setUsername] = useState(profile?.username ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  if (!profile) return null

  const save = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      if (isSupabaseConfigured && supabase) {
        const { error: e } = await supabase
          .from('users')
          .update({
            display_name: displayName.trim() || null,
            username: username.trim() || null,
          })
          .eq('id', profile.id)
        if (e) throw new Error(e.message)
      } else {
        // demo: just acknowledge
        await new Promise((r) => setTimeout(r, 400))
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Profile</h1>
      <p className="mt-1 text-slate-400">Manage your public developer profile.</p>

      <div className="mt-8 card">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-purple-600 text-2xl font-bold text-white">
            {(profile.display_name ?? profile.username ?? 'P').charAt(0)}
          </span>
          <div>
            <div className="font-semibold text-white">
              {profile.display_name ?? profile.username}
            </div>
            <div className="text-sm text-slate-400">{profile.email}</div>
            <span className="badge mt-1 bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30">
              {profile.role}
            </span>
          </div>
        </div>

        {isDemo && (
          <div className="mt-5 rounded-lg bg-amber-500/10 p-3 text-xs text-amber-200 ring-1 ring-amber-500/20">
            Demo mode — changes aren’t saved. Connect Supabase to persist
            profile edits.
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="label">Display name</label>
            <input
              className="input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your studio name"
            />
          </div>
          <div>
            <label className="label">Username</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourhandle"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-200 ring-1 ring-rose-500/20">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saved && <span className="text-sm text-emerald-400">Saved ✓</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
