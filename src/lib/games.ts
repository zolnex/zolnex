import { supabase, isSupabaseConfigured, publicObjectUrl } from './supabase'
import {
  getMockStore,
  getMiniGameBlobUrl,
  mockCoverUrl,
  miniGameIdFor,
} from './mockData'
import type { Game, PlayableGame, GameCategory } from '../types'

// ---------------------------------------------------------------------------
// Unified data access for games.
//
// Every function transparently works against Supabase when configured, or
// against the local in-memory mock store otherwise. The rest of the app never
// needs to know which backend is active.
// ---------------------------------------------------------------------------

export async function fetchGames(opts?: {
  category?: GameCategory | 'All'
  search?: string
  status?: Game['status']
  limit?: number
}): Promise<PlayableGame[]> {
  if (!isSupabaseConfigured) {
    let games = [...getMockStore().games]
    if (opts?.status) games = games.filter((g) => g.status === opts.status)
    else games = games.filter((g) => g.status === 'approved')
    if (opts?.category && opts.category !== 'All')
      games = games.filter((g) => g.category === opts.category)
    if (opts?.search) {
      const q = opts.search.toLowerCase()
      games = games.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q),
      )
    }
    if (opts?.limit) games = games.slice(0, opts.limit)
    return games.map(toPlayable)
  }

  let query = supabase!
    .from('games')
    .select(
      'id, developer_id, title, slug, description, category, status, cover_path, storage_prefix, entry_file, play_count, created_at, developer:users(username, display_name)',
    )
    .eq('status', opts?.status ?? 'approved')
    .order('created_at', { ascending: false })

  if (opts?.category && opts.category !== 'All')
    query = query.eq('category', opts.category)
  if (opts?.search) query = query.ilike('title', `%${opts.search}%`)
  if (opts?.limit) query = query.limit(opts.limit)

  const { data, error } = await query
  if (error) throw error
  return ((data as RawGame[]) ?? []).map((r) => toPlayable(normalizeGame(r)))
}

export async function fetchFeatured(limit = 6): Promise<PlayableGame[]> {
  return fetchGames({ limit })
}

export async function fetchGameBySlug(
  slug: string,
): Promise<PlayableGame | null> {
  if (!isSupabaseConfigured) {
    const g = getMockStore().games.find((x) => x.slug === slug)
    return g ? toPlayable(g) : null
  }
  const { data, error } = await supabase!
    .from('games')
    .select(
      'id, developer_id, title, slug, description, category, status, cover_path, storage_prefix, entry_file, play_count, created_at, developer:users(username, display_name)',
    )
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data ? toPlayable(normalizeGame(data as RawGame)) : null
}

export async function fetchGamesByDeveloper(
  developerId: string,
): Promise<PlayableGame[]> {
  if (!isSupabaseConfigured) {
    return getMockStore()
      .games.filter((g) => g.developer_id === developerId)
      .map(toPlayable)
  }
  const { data, error } = await supabase!
    .from('games')
    .select(
      'id, developer_id, title, slug, description, category, status, cover_path, storage_prefix, entry_file, play_count, created_at',
    )
    .eq('developer_id', developerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return ((data as RawGame[]) ?? []).map((r) => toPlayable(normalizeGame(r)))
}

/** Increment the play counter (best-effort, never blocks playback). */
export async function incrementPlayCount(gameId: string): Promise<void> {
  try {
    if (!isSupabaseConfigured) {
      const g = getMockStore().games.find((x) => x.id === gameId)
      if (g) g.play_count += 1
      return
    }
    await supabase!.rpc('increment_play_count', { game_id: gameId })
  } catch {
    /* non-fatal */
  }
}

export async function fetchDeveloperQuota(developerId: string) {
  if (!isSupabaseConfigured) {
    return {
      developer_id: developerId,
      max_games: 10,
      max_storage_mb: 500,
      used_storage_mb: 73,
    }
  }
  const { data, error } = await supabase!
    .from('developer_quotas')
    .select('*')
    .eq('developer_id', developerId)
    .maybeSingle()
  if (error) throw error
  return data
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * A game row where the joined `developer:users(...)` relation may arrive as a
 * single-element ARRAY (how PostgREST represents a 1:1 join). `normalizeGame`
 * flattens that into our Game shape.
 */
type RawGame = Omit<Game, 'developer'> & {
  developer?: Game['developer'] | NonNullable<Game['developer']>[]
}

function normalizeGame(row: RawGame): Game {
  const { developer, ...rest } = row
  const dev = Array.isArray(developer) ? (developer[0] ?? null) : (developer ?? null)
  return { ...rest, developer: dev }
}

function toPlayable(game: Game): PlayableGame {
  let playUrl: string
  let coverUrl: string | null

  if (!isSupabaseConfigured) {
    playUrl = getMiniGameBlobUrl(miniGameIdFor(game))
    coverUrl = mockCoverUrl(game)
  } else {
    const prefix = game.storage_prefix ?? `games/${game.id}`
    playUrl = publicObjectUrl(`${prefix}/${game.entry_file ?? 'index.html'}`)
    coverUrl = game.cover_path ? publicObjectUrl(game.cover_path) : null
  }

  return { ...game, playUrl, coverUrl }
}

export function formatPlayCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}
