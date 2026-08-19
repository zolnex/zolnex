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
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement))
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
      className="relative mx-auto w-full max-w-4xl overflow-hidden border-2 border-line bg-ink shadow-stamp"
    >
      <div className="flex items-center justify-between border-b-2 border-line bg-raised px-3 py-2">
        <span className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
          Cabinet · {title}
        </span>
        <button
          onClick={toggleFullscreen}
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute transition hover:text-paper"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? 'Exit full' : 'Full screen'}
        </button>
      </div>

      <div className="relative aspect-video bg-ink">
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
          <div className="absolute inset-0 grid place-items-center bg-ink">
            <button
              onClick={() => {
                setStarted(true)
                setLoading(true)
              }}
              className="group flex flex-col items-center gap-4"
            >
              <span className="grid h-[4.5rem] w-[4.5rem] place-items-center bg-ember text-ink shadow-stamp transition group-hover:-translate-x-px group-hover:-translate-y-px group-hover:shadow-stamp-acid">
                <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 fill-current">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper">
                Insert coin
              </span>
            </button>
          </div>
        )}

        {loading && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-ink/50">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-acid" />
          </div>
        )}
      </div>
    </div>
  )
}
