// The app's local "database": one object kept in memory and saved to the phone's
// storage (AsyncStorage) every time it changes. No internet or account needed.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import type { AppData, GameStatus, SearchResult, Settings, TrackedGame } from './types';

const STORAGE_KEY = 'game-tracker-data-v1';

const emptyData: AppData = {
  version: 1,
  games: {},
  settings: { igdbClientId: '', igdbClientSecret: '' },
};

interface Store {
  loaded: boolean;
  data: AppData;
  addFromSearch: (result: SearchResult, status: GameStatus) => void;
  updateGame: (id: string, changes: Partial<TrackedGame>) => void;
  removeGame: (id: string) => void;
  updateSettings: (changes: Partial<Settings>) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  // Load saved data once when the app starts.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw) as AppData;
          setData({ ...emptyData, ...saved, settings: { ...emptyData.settings, ...saved.settings } });
        }
      })
      .catch((e) => console.warn('Could not load saved data', e))
      .finally(() => {
        loadedRef.current = true;
        setLoaded(true);
      });
  }, []);

  // Save whenever data changes (but not before the first load finished,
  // otherwise we'd overwrite saved data with the empty starting state).
  useEffect(() => {
    if (!loadedRef.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch((e) =>
      console.warn('Could not save data', e),
    );
  }, [data]);

  const addFromSearch = useCallback((r: SearchResult, status: GameStatus) => {
    const id = `igdb-${r.igdbId}`;
    const now = new Date().toISOString();
    setData((d) => {
      const existing = d.games[id];
      const game: TrackedGame = existing
        ? { ...existing, status, updatedAt: now }
        : {
            id,
            igdbId: r.igdbId,
            name: r.name,
            coverUrl: r.coverUrl,
            releaseYear: r.releaseYear,
            platforms: r.platforms,
            genres: r.genres,
            status,
            favourite: false,
            addedAt: now,
            updatedAt: now,
          };
      return { ...d, games: { ...d.games, [id]: game } };
    });
  }, []);

  const updateGame = useCallback((id: string, changes: Partial<TrackedGame>) => {
    setData((d) => {
      const g = d.games[id];
      if (!g) return d;
      return {
        ...d,
        games: { ...d.games, [id]: { ...g, ...changes, id, updatedAt: new Date().toISOString() } },
      };
    });
  }, []);

  const removeGame = useCallback((id: string) => {
    setData((d) => {
      const games = { ...d.games };
      delete games[id];
      return { ...d, games };
    });
  }, []);

  const updateSettings = useCallback((changes: Partial<Settings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...changes } }));
  }, []);

  const value = useMemo(
    () => ({ loaded, data, addFromSearch, updateGame, removeGame, updateSettings }),
    [loaded, data, addFromSearch, updateGame, removeGame, updateSettings],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
