import JSZip from 'jszip'

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------

/** Convert a title into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.round(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.round(months / 12)}y ago`
}

export const MAX_UPLOAD_MB = 100

export interface ExtractedGame {
  /** Map of storage path -> blob, rooted at the game folder. */
  files: { path: string; blob: Blob }[]
  /** The path of the entry index.html within the archive. */
  entryFile: string
  /** Bytes across all files. */
  totalBytes: number
}

/**
 * Extract and validate a game ZIP entirely in the browser using JSZip.
 * Finds index.html (at root or inside a single top-level folder) and re-roots
 * every path relative to it so the iframe can load it cleanly.
 */
export async function extractGameZip(file: File): Promise<ExtractedGame> {
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new Error(`ZIP exceeds the ${MAX_UPLOAD_MB}MB limit.`)
  }

  const zip = await JSZip.loadAsync(file)
  const entries = Object.values(zip.files).filter(
    (e) => !e.dir && !e.name.startsWith('__MACOSX/') && !e.name.endsWith('/'),
  )

  if (entries.length === 0) throw new Error('The ZIP is empty.')

  // Locate index.html (root or nested one level deep).
  let entryPath = entries
    .map((e) => e.name)
    .find((n) => /(^|\/)index\.html$/i.test(n))
  if (!entryPath)
    throw new Error('No index.html found in the ZIP. Add one at the root.')

  // Strip the common parent folder so paths are relative to index.html.
  const prefix = entryPath.replace(/index\.html$/i, '')

  const files: { path: string; blob: Blob }[] = []
  let totalBytes = 0
  for (const entry of entries) {
    const path = prefix ? entry.name.slice(prefix.length) : entry.name
    if (!path) continue
    const blob = await entry.async('blob')
    totalBytes += blob.size
    files.push({ path, blob })
  }

  return { files, entryFile: 'index.html', totalBytes }
}
