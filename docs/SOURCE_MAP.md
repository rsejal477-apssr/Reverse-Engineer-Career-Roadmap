# EaseCareer source guide

This repository contains the frontend, backend, learning content, assignments, database migrations, and tests used for EaseCareer. The existing root README describes the product.

| Feature | Files |
| --- | --- |
| Learning library, path views, assignments tab, topic drawer, dashboard | `app/easecareer.tsx` |
| Light theme and assignment styling | `app/easecareer.css`, `app/assignments.css` |
| Career and skill paths, topics, lessons, project briefs, guides | `lib/easecareer-catalog.ts` |
| Topic-specific tasks, practice estimates, deliverables, acceptance checks | `lib/assignments.ts` |
| Browser task progress, notes, bookmarks, lesson and project completion | `lib/learning.ts` |
| AI planner interface and milestone task checklists | `app/roadmapper.tsx` |
| Roadmap contracts, graph validation, prerequisites, effort calculation | `lib/roadmap.ts` |
| Example AI roadmap | `lib/example.ts` |
| Gemini prompts, structured responses, advice and error handling | `lib/gemini.ts` |
| API endpoints | `app/api/*/route.ts` |
| Saved AI connection and encryption | `lib/ai-connection.ts`, `lib/connection-crypto.ts` |
| User identity integration | `app/chatgpt-auth.ts`, `build/sites-vite-plugin.ts` |
| Database access and schema | `db/index.ts`, `db/schema.ts` |
| Database migrations | `drizzle/*.sql` |
| Tests for tasks, progress, AI, persistence and ownership | `tests/roadmap.test.mjs` |
| Local runtime and build helpers | `scripts/`, `build/`, `vite.config.ts` |

## Editing a specific assignment

Find its topic ID in `lib/easecareer-catalog.ts`, then edit the matching entry in `lib/assignments.ts`. Each assignment includes a title, estimated hours, three task steps, a deliverable, and acceptance checks. Aliases intentionally share curriculum. The frontend resolves assignments using the topic ID.

## Local development

Use Node.js 22.13 or newer and pnpm 11.25.0 (declared in package.json).

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

PowerShell users can use `Copy-Item .env.example .env.local` instead of `cp`. Local development uses http://localhost:5173. Catalog roadmaps and tasks can be explored without an AI key. For AI generation, configure your own server-side Gemini key in the ignored local environment file. For encrypted saved connections, also configure a stable 64-character hex encryption key. Never commit real credentials.

```sh
pnpm typecheck
pnpm test
pnpm build
```

See `docs/SETUP.md` for API contracts and database setup. Apply BOTH committed SQL migrations once to a fresh local database. The local sign-in simulation is available at `/signin-with-chatgpt?return_to=/`; it is development-only.

## Hosting dependencies

The current website runs on Vinext and Cloudflare Workers with D1. Hosted sign-in is supplied by Sites; local development uses its mock identity integration. Catalog progress is browser-local, while AI saves and encrypted connections use the database. This source export removes the original hosted project identity and excludes live credentials, database contents, dependencies, and generated build output.

A GitHub upload does not deploy the app. Independent hosting on Vercel requires adapting the Cloudflare bindings and identity integration; this is not yet a standalone Vercel application. See the original hosting provider's configuration workflow before publishing a new instance.

## Verification

The exported application source passed all 23 automated tests. These checks cover roadmap graph behavior, practical task coverage, progress migration, AI response validation, encrypted connections, saved task round-trips, and owner isolation. Live Gemini requests and browser interaction checks require separate verification.
