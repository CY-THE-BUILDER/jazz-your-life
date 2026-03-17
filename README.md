# Fortune Cookie Daily

A mobile-first PWA built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, `html-to-image`, and localStorage only.

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

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://127.0.0.1:3000](http://127.0.0.1:3000)

## Verification

```bash
npm run lint
npm run build
```

## Deploy To Vercel

1. Push this repository to GitHub.
2. Import the GitHub repo into Vercel.
3. Use the default Next.js build settings.
4. Redeploy after each push.

## Features

- Daily deterministic fortune message based on `date + local seed`
- Extra draws on the same day
- Favorites stored in localStorage
- Streak tracking with milestone messages
- Copy text sharing and image export sharing
- PWA manifest and offline-ready service worker via `next-pwa`
