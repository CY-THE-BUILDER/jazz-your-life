# Prisma Setup Notes

This repository now includes the initial `prisma/schema.prisma`, a first SQL migration draft, and the Prisma packages are already installed in `package.json`.

## Current commands

```bash
npx prisma generate
npx prisma migrate dev --name init_noesis_brand
node prisma/seed.mjs
```

## Environment

Add this to `.env.local` or your deployment env:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/noesis
```

Prisma 7 in this repo reads that value from [prisma.config.ts](/Users/chungyintsai/Documents/Playground/prisma.config.ts), not from `datasource.url` inside the schema.

## Seed direction

`seed-data.json` contains the first brand/site/project records you can transform into a proper seed script once Prisma is installed.
