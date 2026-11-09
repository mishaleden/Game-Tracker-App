# Game Tracker — project guide for Claude

A personal video game tracker (like TV Time, but for games) for one user on a
**Samsung Galaxy Z Fold 6**. Built with **Expo SDK 58 / React Native / TypeScript /
Expo Router**. The owner is not a developer: explain changes in plain language,
work in small steps, and commit after each working step.

Also read `AGENTS.md` (Expo's own rules: use `npx expo install`, check versioned
docs, never hand-edit `android/`/`ios/`).

## Hard requirements
- Single user, **no login, no backend**. All data lives on the phone and the app
  works offline (only IGDB search and cover images need internet).
- Layout must work on the **cover screen (~370dp wide)** and the **unfolded inner
  screen (~700–770dp wide)**, and survive folding/unfolding while open.
  Use `useWindowDimensions` / helpers in `src/lib/layout.ts`; never hard-code widths.
  `app.json` orientation is `default` so the inner screen can rotate.

## Layout of the code
```
src/app/                 Screens (Expo Router: every file is a route)
  _layout.tsx            Root: StoreProvider + Stack navigator
  (tabs)/_layout.tsx     Bottom tabs: Library, Search, Settings
  (tabs)/index.tsx       Library: filter chips per list + cover grid
  (tabs)/search.tsx      IGDB search + "Add to list"
  (tabs)/settings.tsx    IGDB Client ID / Secret
src/components/          Reusable UI (GameCover, StatusPicker)
src/lib/types.ts         Data model (TrackedGame, AppData, Settings)
src/lib/store.tsx        Local "database": React context + AsyncStorage
src/lib/igdb.ts          IGDB API client (Twitch token + /v4/games search)
src/lib/layout.ts        Fold-aware layout helpers
src/lib/theme.ts         Colours (single dark theme)
```

## Data model decisions
- All data is one `AppData` object saved as JSON under the AsyncStorage key
  `game-tracker-data-v1`. This same object will be the backup export format.
  If the shape changes incompatibly, bump `version` and add a migration in `store.tsx`.
- Each game has exactly one `status` (playing / completed / backlog / wishlist /
  dropped). **Favourites is a separate boolean flag**, so a game can be Completed
  *and* a Favourite. The Library shows Favourites as its own filter.
- Game ids: `igdb-<igdbId>` for searched games, `manual-<timestamp>` for manual ones.

## IGDB
- Needs a Twitch developer app's Client ID + Secret, entered by the user in
  Settings and stored locally. Token from `https://id.twitch.tv/oauth2/token`
  (client_credentials), cached in memory. Search = POST `https://api.igdb.com/v4/games`
  with an Apicalypse body. Covers: `https://images.igdb.com/igdb/image/upload/t_cover_big/<image_id>.jpg`.
- IGDB blocks browser (CORS) requests, so search only works on the phone, not in web preview.

## Commands
```bash
npm install
npx expo start              # dev server; scan QR with Expo Go on the phone
npx tsc --noEmit            # typecheck — run before every commit
EXPO_OFFLINE=1 npx expo install <pkg>   # add packages (EXPO_OFFLINE if api.expo.dev is unreachable)
npx expo export --platform android      # check the Android bundle builds
```

## Roadmap (version 1)
- [x] Step 1: Search IGDB + add to lists (Playing, Completed, Backlog, Wishlist, Dropped, Favourites flag)
- [ ] Step 2: Game detail screen with per-game log: platform played, hours,
      start/finish date, rating, completion %, platinum/100% flag, notes
- [ ] Step 3: Manual add for games not found in search
- [ ] Step 4: Stats screen: games per year, total hours, hours by platform, top genres
- [ ] Step 5: PowerPyx guide search button per game; Settings fields for
      PSNProfiles and TrueAchievements profile links
- [ ] Step 6: Export / import JSON backup file
- [ ] Step 7: Build an installable APK with EAS (`npx eas-cli@latest build -p android --profile preview`)
