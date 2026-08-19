import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase, isSupabaseConfigured, STORAGE_BUCKET } from '../lib/supabase'
import { extractGameZip, slugify, formatBytes, MAX_UPLOAD_MB } from '../lib/utils'
import { getMockStore } from '../lib/mockData'
import { GAME_CATEGORIES, type GameCategory } from '../types'

type Stage = 'form' | 'uploading' | 'done' | 'error'

export function Upload() {
  const { profile, isDemo } = useAuth()
  const navigate = useNavigate()
  const fileInput = useRef<HTMLInputElement>(null)
  const coverInput = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<GameCategory>('Arcade')
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const [stage, setStage] = useState<Stage>('form')
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [error, setError] = useState('')

  const onTitleChange = (v: string) => {
    setTitle(v)
    if (!slug || slug === slugify(title)) setSlug(slugify(v))
  }

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0]
    if (!f) return
    if (!/\.zip$/i.test(f.name)) {
      setError('Please select a .zip file.')
      return
    }
    setError('')
    setZipFile(f)
  }

  const canSubmit = Boolean(title.trim() && slug.trim() && zipFile)

  const submit = async () => {
    if (!canSubmit || !zipFile || !profile) return
    setStage('uploading')
    setError('')

    try {
      setStatusText('Inspecting ZIP…')
      setProgress(5)
      const extracted = await extractGameZip(zipFile)
      setStatusText(`Extracted ${extracted.files.length} files (${formatBytes(extracted.totalBytes)})`)
      setProgress(20)

      // ----- DEMO MODE: simulate a successful publish into the mock store -----
      if (!isSupabaseConfigured) {
        await wait(400)
        setProgress(60)
        setStatusText('Uploading files to storage…')
        await wait(500)
        const id = `demo-${Date.now()}`
        getMockStore().games.unshift({
          id,
          developer_id: profile.id,
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          category,
          status: 'approved',
          cover_path: `mock/${id}.svg`,
          storage_prefix: `games/${id}`,
          entry_file: 'index.html',
          play_count: 0,
          created_at: new Date().toISOString(),
          developer: {
            username: profile.username,
            display_name: profile.display_name,
          },
        })
        // Reuse an existing mini-game so the freshly-uploaded game is playable.
        setProgress(100)
        setStatusText('Published!')
        setStage('done')
        return
      }

      // ----- REAL MODE: upload to Supabase Storage + create game record -----
      const gameId = crypto.randomUUID()
      const prefix = `games/${gameId}`
      const storage = supabase!.storage.from(STORAGE_BUCKET)

      setStatusText('Uploading game files…')
      let uploaded = 0
      for (const { path, blob } of extracted.files) {
        const contentType = mimeFor(path)
        const { error: upErr } = await storage.upload(
          `${prefix}/${path}`,
          blob,
          { contentType, upsert: false },
        )
        if (upErr) throw new Error(`Upload failed: ${upErr.message}`)
        uploaded++
        setProgress(20 + Math.round((uploaded / extracted.files.length) * 60))
      }

      let coverPath: string | null = null
      if (coverFile) {
        setStatusText('Uploading cover image…')
        const { error: cErr } = await storage.upload(
          `${prefix}/cover.${extOf(coverFile.name)}`,
          coverFile,
          { contentType: coverFile.type, upsert: false },
        )
        if (!cErr) coverPath = `${prefix}/cover.${extOf(coverFile.name)}`
        setProgress(85)
      }

      setStatusText('Creating game record…')
      const { error: dbErr } = await supabase!.from('games').insert({
        id: gameId,
        developer_id: profile.id,
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        category,
        status: 'pending',
        cover_path: coverPath,
        storage_prefix: prefix,
        entry_file: 'index.html',
        play_count: 0,
      })
      if (dbErr) throw new Error(`Database error: ${dbErr.message}`)

      setProgress(100)
      setStatusText('Submitted for review!')
      setStage('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
      setStage('error')
    }
  }

  if (stage === 'uploading') {
    return <ProgressView progress={progress} text={statusText} />
  }
  if (stage === 'done') {
    return (
      <SuccessView
        isDemo={isDemo}
        slug={slug.trim()}
        onDone={() => navigate('/dashboard')}
        onAnother={() => {
          setTitle('')
          setSlug('')
          setDescription('')
          setZipFile(null)
          setCoverFile(null)
          setStage('form')
        }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Upload a game</h1>
      <p className="mt-1 text-slate-400">
        Drop a ZIP containing your HTML5 game. Must include an{' '}
        <code className="text-brand-300">index.html</code>.
      </p>

      {isDemo && (
        <div className="mt-4 rounded-xl bg-amber-500/10 p-4 text-sm text-amber-200 ring-1 ring-amber-500/20">
          Demo mode: uploads are simulated locally so you can preview the full
          flow. Connect Supabase to persist real games.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-200 ring-1 ring-rose-500/20">
          {error}
        </div>
      )}

      <div className="mt-8 space-y-6">
        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFiles(e.dataTransfer.files)
          }}
          onClick={() => fileInput.current?.click()}
          className={
            'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ' +
            (dragOver
              ? 'border-brand-400 bg-brand-500/10'
              : 'border-white/15 bg-slate-800/40 hover:border-white/30')
          }
        >
          <input
            ref={fileInput}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="text-4xl">📦</div>
          {zipFile ? (
            <div className="mt-3">
              <div className="font-semibold text-white">{zipFile.name}</div>
              <div className="text-sm text-slate-400">
                {formatBytes(zipFile.size)} · click to replace
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <div className="font-semibold text-white">
                Drop your game ZIP here
              </div>
              <div className="text-sm text-slate-400">
                or click to browse · max {MAX_UPLOAD_MB}MB
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="My Awesome Game"
            />
          </div>
          <div>
            <label className="label">URL slug</label>
            <input
              className="input"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="my-awesome-game"
            />
            <p className="mt-1 text-xs text-slate-500">
              /game/{slug || 'my-awesome-game'}
            </p>
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-24"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your game in a sentence or two…"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value as GameCategory)}
            >
              {GAME_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Cover image (optional)</label>
            <input
              ref={coverInput}
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/20"
            />
            {coverFile && (
              <p className="mt-1 text-xs text-slate-500">{coverFile.name}</p>
            )}
          </div>
        </div>

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="btn-primary w-full"
        >
          Publish game
        </button>
      </div>
    </div>
  )
}

function ProgressView({ progress, text }: { progress: number; text: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-brand-400" />
      <h2 className="mt-6 text-xl font-bold text-white">Publishing your game</h2>
      <p className="mt-1 text-sm text-slate-400">{text}</p>
      <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-slate-500">{progress}%</div>
    </div>
  )
}

function SuccessView({
  isDemo,
  slug,
  onDone,
  onAnother,
}: {
  isDemo: boolean
  slug: string
  onDone: () => void
  onAnother: () => void
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-3xl ring-1 ring-emerald-500/30">
        ✅
      </div>
      <h2 className="mt-6 text-2xl font-bold text-white">Game submitted!</h2>
      <p className="mt-2 text-slate-400">
        {isDemo
          ? 'Your game has been added to the demo library and is ready to play.'
          : 'Your game is now pending admin review. We’ll publish it once approved.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {isDemo && (
          <button
            onClick={() => (window.location.hash = `#/game/${slug}`)}
            className="btn-primary"
          >
            Play it now
          </button>
        )}
        <button onClick={onDone} className="btn-ghost">
          Go to dashboard
        </button>
        <button onClick={onAnother} className="btn-ghost">
          Upload another
        </button>
      </div>
    </div>
  )
}

// --- small helpers ---------------------------------------------------------

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function extOf(name: string) {
  const m = /\.(\w+)$/.exec(name)
  return m ? m[1].toLowerCase() : 'jpg'
}

function mimeFor(path: string): string {
  const ext = extOf(path)
  const map: Record<string, string> = {
    html: 'text/html',
    htm: 'text/html',
    js: 'text/javascript',
    mjs: 'text/javascript',
    css: 'text/css',
    json: 'application/json',
    svg: 'image/svg+xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    ico: 'image/x-icon',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    otf: 'font/otf',
    mp3: 'audio/mpeg',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
    mp4: 'video/mp4',
    webm: 'video/webm',
    gltf: 'model/gltf+json',
    glb: 'model/gltf-binary',
  }
  return map[ext] ?? 'application/octet-stream'
}
