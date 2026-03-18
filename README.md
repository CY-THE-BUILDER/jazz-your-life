# jazz-your-life

A curated daily jazz companion built with Next.js 14, TypeScript, Tailwind CSS, localStorage, and Spotify OAuth.

## Local Development

1. Load Node via `nvm`:

   ```bash
   export NVM_DIR="$HOME/.nvm"
   . "$NVM_DIR/nvm.sh"
   nvm use
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your environment file:

   ```bash
   cp .env.example .env.local
   ```

4. In the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard), create an app and add these redirect URIs:

   ```text
   http://127.0.0.1:3000/api/spotify/callback
   https://fortunecookiedaily.cythebuilder.com/api/spotify/callback
   ```

5. Fill in `SPOTIFY_CLIENT_ID` in `.env.local`.

6. Start the dev server:

   ```bash
   npm run dev
   ```

7. Open [http://127.0.0.1:3000](http://127.0.0.1:3000)

## Verification

```bash
npm run lint
npm run build
```

## Deploy To Vercel

1. Push this repository to GitHub.
2. Import the GitHub repo into Vercel as `jazz-your-life`.
3. Use the default Next.js build settings.
4. Add `SPOTIFY_CLIENT_ID` to production env.
5. Redeploy after each push.

## Features

- Daily curated jazz picks with quick vibe filters
- Save and share picks with local persistence
- Spotify OAuth login via Authorization Code with PKCE
- Spotify session detection and disconnect flow
- PWA manifest and offline-ready service worker via `next-pwa`
