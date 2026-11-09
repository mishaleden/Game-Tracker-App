// Talks to the IGDB games database (owned by Twitch).
// IGDB needs a Twitch "Client ID" + "Client Secret", which the user enters in Settings.
// We swap those for a temporary access token, then use the token to search.

import type { SearchResult, Settings } from './types';

let cachedToken: { clientId: string; token: string; expiresAt: number } | null = null;

async function getToken(settings: Settings): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.clientId === settings.igdbClientId && cachedToken.expiresAt > now) {
    return cachedToken.token;
  }
  const url =
    'https://id.twitch.tv/oauth2/token' +
    `?client_id=${encodeURIComponent(settings.igdbClientId)}` +
    `&client_secret=${encodeURIComponent(settings.igdbClientSecret)}` +
    '&grant_type=client_credentials';
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    throw new Error('Could not log in to IGDB. Check your Client ID and Secret in Settings.');
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    clientId: settings.igdbClientId,
    token: json.access_token,
    // Refresh a minute early to be safe.
    expiresAt: now + (json.expires_in - 60) * 1000,
  };
  return json.access_token;
}

export function coverUrl(imageId: string, size: 'cover_big' | 'cover_small' = 'cover_big') {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

interface IgdbGame {
  id: number;
  name: string;
  first_release_date?: number; // unix seconds
  cover?: { image_id: string };
  platforms?: { name: string; abbreviation?: string }[];
  genres?: { name: string }[];
}

export async function searchGames(query: string, settings: Settings): Promise<SearchResult[]> {
  if (!settings.igdbClientId || !settings.igdbClientSecret) {
    throw new Error('Add your IGDB Client ID and Secret in Settings to search.');
  }
  const token = await getToken(settings);
  // IGDB's query language. Quotes inside the search text are escaped.
  const body =
    `search "${query.replace(/"/g, '\\"')}";` +
    ' fields name, first_release_date, cover.image_id, platforms.name, platforms.abbreviation, genres.name;' +
    ' limit 40;';
  const res = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': settings.igdbClientId,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body,
  });
  if (res.status === 401) {
    cachedToken = null;
    throw new Error('IGDB rejected the login. Check your Client ID and Secret in Settings.');
  }
  if (!res.ok) {
    throw new Error(`IGDB search failed (error ${res.status}). Try again in a moment.`);
  }
  const games = (await res.json()) as IgdbGame[];
  return games.map((g) => ({
    igdbId: g.id,
    name: g.name,
    coverUrl: g.cover ? coverUrl(g.cover.image_id) : undefined,
    releaseYear: g.first_release_date
      ? new Date(g.first_release_date * 1000).getUTCFullYear()
      : undefined,
    platforms: (g.platforms ?? []).map((p) => p.abbreviation || p.name),
    genres: (g.genres ?? []).map((x) => x.name),
  }));
}
