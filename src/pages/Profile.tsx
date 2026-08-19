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
      <p className="kicker">Account</p>
      <h1 className="display mt-2 text-4xl">Profile</h1>
      <p className="mt-2 text-mute">How you show up on the floor.</p>

      <div className="card mt-8">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center bg-ember font-display text-2xl font-extrabold text-ink">
            {(profile.display_name ?? profile.username ?? 'P').charAt(0)}
          </span>
          <div>
            <div className="font-display text-xl font-extrabold text-paper">
              {profile.display_name ?? profile.username}
            </div>
            <div className="font-mono text-[11px] text-mute">{profile.email}</div>
            <span className="badge mt-2 bg-acid text-ink">{profile.role}</span>
          </div>
        </div>

        {isDemo && (
          <div className="mt-5 border-2 border-acid/40 bg-acid/10 p-3 font-mono text-[11px] uppercase tracking-[0.12em] text-paper">
            Demo cabinet — edits aren’t saved. Connect Supabase to persist.
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
            <div className="border-2 border-ember bg-ember/10 p-3 text-sm text-paper">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saved && (
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-acid">
                Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
