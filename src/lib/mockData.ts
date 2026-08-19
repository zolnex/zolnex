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
  hue: number
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
      'A modern twist on the classic brick-breaker. Smash through glowing neon bricks, keep the ball alive, and chase a high score.',
    miniGameId: 'breaker',
    developer: 'PixelForge',
    hue: 210,
    playCount: 48213,
    featured: true,
  },
  {
    id: 'g2',
    title: 'Grid Master 2048',
    slug: 'grid-master-2048',
    category: 'Puzzle',
    description:
      'Slide and merge numbered tiles to reach 2048 — and beyond. Simple to learn, fiendishly hard to master.',
    miniGameId: 'g2048',
    developer: 'MindBend Studios',
    hue: 270,
    playCount: 31980,
    featured: true,
  },
  {
    id: 'g3',
    title: 'Snake Pulse',
    slug: 'snake-pulse',
    category: 'Arcade',
    description:
      'The timeless snake game, reborn. Eat, grow, and don’t bite your own tail. How long can you get?',
    miniGameId: 'snake',
    developer: 'RetroByte',
    hue: 150,
    playCount: 27654,
  },
  {
    id: 'g4',
    title: 'Memory Match',
    slug: 'memory-match',
    category: 'Puzzle',
    description:
      'Flip the cards, find the pairs, and clear the board in as few moves as possible. Great for a quick brain warm-up.',
    miniGameId: 'memory',
    developer: 'Lumi Games',
    hue: 330,
    playCount: 19432,
  },
  {
    id: 'g5',
    title: 'Tic Tactics',
    slug: 'tic-tactics',
    category: 'Strategy',
    description:
      'Classic tic-tac-toe against an unbeatable minimax AI. Can you force a draw — or even sneak out a win?',
    miniGameId: 'tic',
    developer: 'DeepPlay',
    hue: 30,
    playCount: 14210,
    featured: true,
  },
  {
    id: 'g6',
    title: 'Reflex Rush',
    slug: 'reflex-rush',
    category: 'Casual',
    description:
      'Test your reaction speed. Wait for green, then click as fast as humanly possible. Beat your personal best.',
    miniGameId: 'reaction',
    developer: 'QuickFingers',
    hue: 100,
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
  const hue = SEED.find((s) => s.id === game.id)?.hue ?? 220
  const title = encodeURIComponent(game.title)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue},70%,22%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 40) % 360},80%,45%)"/>
    </linearGradient></defs>
    <rect width="480" height="270" fill="url(#g)"/>
    <g fill="#ffffff" opacity="0.95" font-family="Inter,Arial,sans-serif">
      <text x="32" y="150" font-size="40" font-weight="800">${title}</text>
    </g>
    <circle cx="410" cy="60" r="50" fill="#ffffff" opacity="0.12"/>
    <circle cx="70" cy="230" r="80" fill="#ffffff" opacity="0.08"/>
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
