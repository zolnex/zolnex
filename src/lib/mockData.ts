import type { Game, GameCategory } from '../types'
import { MINI_GAMES } from './miniGames'

// ---------------------------------------------------------------------------
// Demo-mode data (used when Supabase is not configured).
// Lets the entire portal be explored end-to-end, including real gameplay.
// ---------------------------------------------------------------------------

interface MockGameSeed {
  id: string
  title: string
  slug: string
  category: GameCategory
  description: string
  miniGameId: keyof typeof MINI_GAMES
  developer: string
  playCount: number
  featured?: boolean
}

const SEED: MockGameSeed[] = [
  {
    id: 'g1',
    title: 'Neon Breaker',
    slug: 'neon-breaker',
    category: 'Arcade',
    description:
      'Paddle, ball, a wall of printed bricks. Keep it in play long enough to clear the cabinet.',
    miniGameId: 'breaker',
    developer: 'PixelForge',
    playCount: 48213,
    featured: true,
  },
  {
    id: 'g2',
    title: 'Grid Master 2048',
    slug: 'grid-master-2048',
    category: 'Puzzle',
    description:
      'Slide the tiles. Double them. 2048 is the excuse — the board is the game.',
    miniGameId: 'g2048',
    developer: 'MindBend Studios',
    playCount: 31980,
    featured: true,
  },
  {
    id: 'g3',
    title: 'Snake Pulse',
    slug: 'snake-pulse',
    category: 'Arcade',
    description:
      'Eat, grow, don’t meet yourself. The grid is small. You will not stay small.',
    miniGameId: 'snake',
    developer: 'RetroByte',
    playCount: 27654,
  },
  {
    id: 'g4',
    title: 'Memory Match',
    slug: 'memory-match',
    category: 'Puzzle',
    description:
      'Flip two. Remember where they lived. Clear the table in as few mistakes as you can stand.',
    miniGameId: 'memory',
    developer: 'Lumi Games',
    playCount: 19432,
  },
  {
    id: 'g5',
    title: 'Tic Tactics',
    slug: 'tic-tactics',
    category: 'Strategy',
    description:
      'Noughts and crosses against a minimax that does not get bored. A draw is a respectable night.',
    miniGameId: 'tic',
    developer: 'DeepPlay',
    playCount: 14210,
    featured: true,
  },
  {
    id: 'g6',
    title: 'Reflex Rush',
    slug: 'reflex-rush',
    category: 'Casual',
    description:
      'Wait for green. Click. The clock is meaner than it looks.',
    miniGameId: 'reaction',
    developer: 'QuickFingers',
    playCount: 9870,
  },
]

export function buildMockGames(): Game[] {
  return SEED.map((s) => ({
    id: s.id,
    developer_id: 'demo-dev',
    title: s.title,
    slug: s.slug,
    description: s.description,
    category: s.category,
    status: 'approved',
    cover_path: `mock/${s.id}.svg`,
    storage_prefix: `mock/${s.id}`,
    entry_file: 'index.html',
    play_count: s.playCount,
    created_at: new Date(Date.now() - Math.random() * 1e10).toISOString(),
    developer: { username: s.developer.toLowerCase(), display_name: s.developer },
  }))
}

/** In-memory mock store so "play" increments stick during a demo session. */
const store: { games: Game[] } = { games: buildMockGames() }
export function getMockStore() {
  return store
}

/** Blob URL cache for demo mini-games (built lazily). */
const blobCache = new Map<string, string>()
export function getMiniGameBlobUrl(miniGameId: keyof typeof MINI_GAMES): string {
  const cached = blobCache.get(miniGameId)
  if (cached) return cached
  const html = MINI_GAMES[miniGameId]
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  blobCache.set(miniGameId, url)
  return url
}

export function mockCoverUrl(game: Game): string {
  const seed = SEED.find((s) => s.id === game.id)
  if (seed) return `${import.meta.env.BASE_URL}covers/${seed.slug}.jpg`
  const title = encodeURIComponent(game.title)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270">
    <rect width="480" height="270" fill="#100e0c"/>
    <rect x="16" y="16" width="448" height="238" fill="#f3ead8"/>
    <rect x="28" y="28" width="424" height="214" fill="#1a1613"/>
    <circle cx="400" cy="70" r="36" fill="#ff4d1c"/>
    <rect x="48" y="188" width="120" height="18" fill="#d8f04a"/>
    <text x="48" y="160" fill="#f3ead8" font-size="28" font-weight="800" font-family="Georgia,serif">${title}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${svg}`
}

export function miniGameIdFor(game: Game): keyof typeof MINI_GAMES {
  const seed = SEED.find((s) => s.id === game.id)
  return (seed?.miniGameId ?? 'reaction') as keyof typeof MINI_GAMES
}

export const MOCK_DEVELOPER = {
  id: 'demo-dev',
  email: 'demo@zolnex.dev',
  username: 'pixelforge',
  display_name: 'PixelForge',
  avatar_url: null,
  role: 'developer' as const,
  created_at: new Date(Date.now() - 1e10).toISOString(),
}
