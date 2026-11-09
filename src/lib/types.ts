// Shapes of the data the app stores on the phone.

/** The list a game is in. A game is in exactly one of these at a time. */
export type GameStatus = 'playing' | 'completed' | 'backlog' | 'dropped' | 'wishlist';

export const STATUSES: { key: GameStatus; label: string }[] = [
  { key: 'playing', label: 'Playing' },
  { key: 'completed', label: 'Completed' },
  { key: 'backlog', label: 'Backlog' },
  { key: 'wishlist', label: 'Wishlist' },
  { key: 'dropped', label: 'Dropped' },
];

/** A game in the user's library. */
export interface TrackedGame {
  /** "igdb-1234" for games from search, "manual-<timestamp>" for manually added games. */
  id: string;
  igdbId?: number;
  name: string;
  coverUrl?: string;
  releaseYear?: number;
  /** Platforms the game is available on (from IGDB). */
  platforms: string[];
  genres: string[];
  status: GameStatus;
  /** Favourite is a separate flag, so a game can be both "Completed" and a favourite. */
  favourite: boolean;
  addedAt: string; // ISO date
  updatedAt: string; // ISO date
}

export interface Settings {
  igdbClientId: string;
  igdbClientSecret: string;
}

/** Everything saved on the phone, as one object. Also the shape of the backup file. */
export interface AppData {
  version: 1;
  games: Record<string, TrackedGame>;
  settings: Settings;
}

/** A search result from IGDB (not yet in the library). */
export interface SearchResult {
  igdbId: number;
  name: string;
  coverUrl?: string;
  releaseYear?: number;
  platforms: string[];
  genres: string[];
}
