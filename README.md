# Vanguard

Vanguard is a daily jazz recommendation app built for listeners who want a strong first record without disappearing into the Spotify maze.

It starts with a curated shelf, then leans into Spotify signals when the user connects an account. The goal is simple: open the app, feel a clear direction, and move into the right album quickly.

Production URL: [https://vanguard.noesis.studio](https://vanguard.noesis.studio)

## What It Does

- Serves five listening directions: `Classic`, `Exploratory`, `Fusion`, `Late Night`, and `Focus`
- Rotates recommendation shelves to keep each visit feeling fresh
- Hands off directly to Spotify playback
- Supports saving and sharing albums
- Connects to Spotify with OAuth PKCE for listener-aware recommendations
- Falls back gracefully to public artwork and curated shelves when Spotify is not connected

## Local Development

1. Load Node with `nvm`:

   ```bash
   export NVM_DIR="$HOME/.nvm"
   . "$NVM_DIR/nvm.sh"
   nvm use
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local env file:

   ```bash
   cp .env.example .env.local
   ```

4. In the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), create an app and allow these redirect URIs:

   ```text
   http://127.0.0.1:3000/api/spotify/callback
   https://vanguard.noesis.studio/api/spotify/callback
   ```

5. Set `SPOTIFY_CLIENT_ID` in `.env.local`.
6. Set `SITE_URL=https://vanguard.noesis.studio` in `.env.local` if you want local metadata and OAuth redirects to mirror production.
7. Start the app:

   ```bash
   npm run dev
   ```

8. Open [http://127.0.0.1:3000](http://127.0.0.1:3000)

## Verification

```bash
npm test
npm run lint
npm run build
```

## Deployment

1. Push the repository to GitHub.
2. Import the repo into Vercel as `vanguard`.
3. Add `SPOTIFY_CLIENT_ID` to production environment variables.
4. Add `SITE_URL=https://vanguard.noesis.studio` to production environment variables.
5. In Spotify Dashboard, make sure this callback is allowlisted:

   ```text
   https://vanguard.noesis.studio/api/spotify/callback
   ```

6. Redeploy after each production change.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Vitest
- Spotify Web API + OAuth PKCE
- `next-pwa`
