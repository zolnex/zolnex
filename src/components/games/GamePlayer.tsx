import { useEffect, useRef, useState } from 'react'

interface GamePlayerProps {
  src: string
  title: string
}

/**
 * Responsive, fullscreen-capable iframe game player.
 *
 * Loads the game from a cross-origin static URL (Supabase Storage) in an
 * isolated iframe. Includes a play overlay (so the iframe doesn't spin up
 * until the user opts in) and a fullscreen toggle.
 */
export function GamePlayer({ src, title }: GamePlayerProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onFs = () =>
      setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const toggleFullscreen = async () => {
    const el = wrapRef.current
    if (!el) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await el.requestFullscreen()
    }
  }

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-2xl bg-slate-950 shadow-2xl ring-1 ring-white/10"
    >
      {started ? (
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; fullscreen; gamepad; pointer-lock; cross-origin-isolated"
          sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms"
          onLoad={() => setLoading(false)}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-slate-900 to-slate-950">
          <button
            onClick={() => {
              setStarted(true)
              setLoading(true)
            }}
            className="group flex flex-col items-center gap-3"
          >
            <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-purple-600 text-white shadow-xl shadow-brand-500/40 transition group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="ml-1 h-9 w-9 fill-white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="font-semibold text-white">Click to play</span>
          </button>
        </div>
      )}

      {loading && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-slate-950/40">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-brand-400" />
        </div>
      )}

      <button
        onClick={toggleFullscreen}
        className="absolute right-3 top-3 rounded-lg bg-slate-950/70 p-2 text-slate-200 backdrop-blur transition hover:bg-slate-950"
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        aria-label="Toggle fullscreen"
      >
        {isFullscreen ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M7 14H5v5h5v-2H7zm-2-4h2V7h3V5H5zm12 7h-3v2h5v-5h-2zM14 5v2h3v3h2V5z" />
          </svg>
        )}
      </button>
    </div>
  )
}
