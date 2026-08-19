// ---------------------------------------------------------------------------
// Shared application types
// ---------------------------------------------------------------------------

export type UserRole = 'player' | 'developer' | 'admin'

export type GameStatus = 'pending' | 'approved' | 'rejected'

export type GameCategory =
  | 'Action'
  | 'Adventure'
  | 'Arcade'
  | 'Puzzle'
  | 'Racing'
  | 'Shooter'
  | 'Strategy'
  | 'Sports'
  | 'Simulation'
  | 'Casual'

export const GAME_CATEGORIES: GameCategory[] = [
  'Action',
  'Adventure',
  'Arcade',
  'Puzzle',
  'Racing',
  'Shooter',
  'Strategy',
  'Sports',
  'Simulation',
  'Casual',
]

/** Profile row in the `users` table (created via trigger on signup). */
export interface UserProfile {
  id: string
  email: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
}

/** Row in the `games` table. */
export interface Game {
  id: string
  developer_id: string
  title: string
  slug: string
  description: string | null
  category: GameCategory | null
  status: GameStatus
  cover_path: string | null
  storage_prefix: string | null
  entry_file: string
  play_count: number
  created_at: string
  /** Joined fields (optional) */
  developer?: Pick<UserProfile, 'username' | 'display_name'> | null
}

/** Row in the `developer_quotas` table. */
export interface DeveloperQuota {
  developer_id: string
  max_games: number
  max_storage_mb: number
  used_storage_mb: number
}

/** A game with its resolved public URLs for the player & cover. */
export interface PlayableGame extends Game {
  coverUrl: string | null
  playUrl: string
}

export interface GameUploadInput {
  title: string
  slug: string
  description: string
  category: GameCategory
  files: { path: string; blob: Blob }[]
  coverBlob?: Blob | null
}
