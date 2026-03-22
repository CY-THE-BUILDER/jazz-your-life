# Deployment Environment Checklist

## Vercel

Set these environment variables in your Vercel project for `Production`, `Preview`, and `Development` as needed:

- `DATABASE_URL`
- `ADMIN_SECRET`
- `SITE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `SPOTIFY_CLIENT_ID` if you still use the Spotify app flow

Recommended values:

```bash
SITE_URL=https://www.noesis.studio
NEXT_PUBLIC_SITE_URL=https://www.noesis.studio
```

For Vercel, environment variables are configured in Project Settings or with the CLI:

```bash
vercel env add DATABASE_URL production
vercel env add ADMIN_SECRET production
vercel env add SITE_URL production
vercel env add NEXT_PUBLIC_SITE_URL production
```

Official references:

- https://vercel.com/docs/environment-variables
- https://vercel.com/docs/cli/env

## Local

Keep secrets in `.env.local`, which is now ignored by Git.
