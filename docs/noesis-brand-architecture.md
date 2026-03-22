# Noesis Studio Brand Architecture

## Positioning

`noesis.studio` is the parent brand and narrative home for a family of side projects.
The root site should act as:

- a brand statement
- a curated entry point into all projects
- a future-ready content system for essays, experiments, and product launches

The brand tone is calm, restrained, textural, philosophical, and premium.

## Information Architecture

### Root level

- `/` Brand landing page
- `/projects/[slug]` Product pages or live apps
- `/essays/[slug]` Long-form thinking and philosophy
- `/labs/[slug]` Experimental artifacts
- `/about` Studio, founder perspective, process

### Content hierarchy

1. `Brand`
2. `Site`
3. `Page`
4. `Section`
5. `Block`
6. `Translation`
7. `Asset`
8. `Project`

This keeps visual identity, page structure, and project metadata separate so the system can scale without coupling every page to one schema.

## Database Design Principles

- Use a single brand-aware schema now, even if there is only one site at the start.
- Treat translation as first-class data.
- Split presentational structure from product/project records.
- Store theme tokens and icons as versionable brand assets.
- Support ordered sections and blocks so a future CMS can drive the landing page without code deploys.
- Model SEO separately from visible page content.

## Recommended Stack

- Database: PostgreSQL
- ORM: Prisma
- Admin/CMS options:
  - custom internal admin
  - Sanity
  - Payload
  - Supabase Studio plus custom forms

## Suggested Next Phase

1. Promote one chosen icon into the app metadata and PWA icons.
2. Add `/projects`, `/essays`, and `/about` as stable brand surfaces.
3. Move hard-coded landing content into database-backed records.
4. Add admin tooling for project publishing and localized copy management.

## Current Repo Status

- Root landing is now positioned as the parent studio site.
- `Jazz Your Life` is mounted at `/projects/jazz-your-life`.
- Prisma schema and first migration draft live under `prisma/`.
- Brand icons have initial SVG directions, with `Stillness Orbit` promoted as the current default mark.
