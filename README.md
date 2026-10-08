# EaseCareer — Reverse-Engineered Career Roadmapper

EaseCareer helps learners turn a target career into an actionable plan. Browse career and skill paths, follow topics and assignments, complete projects and lessons, track progress, and generate a personalized AI roadmap.

**Live website:** https://easecareer.aqua-vole-0188.chatgpt.site/

## Features

- Explore 95 career and skill paths, including Frontend, Backend, Full Stack, Android, DevOps, AI Engineering, and Data Analysis.
- Study roadmap topics with practical assignments, estimated effort, deliverables, and acceptance checks.
- Browse lessons, project briefs, and guides.
- Bookmark paths and track learning progress and notes in the browser.
- Generate AI roadmaps from a goal, existing skills, weekly study hours, and target timeline.
- Replan as milestones are completed; save and reopen AI roadmaps when signed in.

## Source structure

```text
.
├── README.md                    # This guide
├── app/                         # Pages, UI, styles, authentication, and API routes
│   ├── api/                     # AI generation, advice, replanning, and saved roadmaps
│   ├── easecareer.tsx           # Learning library and path views
│   ├── roadmapper.tsx           # AI planner interface
│   └── assignments.css          # Assignment styling
├── components/                  # Reusable UI components
├── lib/                         # Catalog, tasks, learning state, roadmap and AI logic
│   ├── easecareer-catalog.ts    # Career paths, topics, lessons, projects, and guides
│   ├── assignments.ts           # Topic-specific task steps and deliverables
│   ├── learning.ts              # Browser progress, bookmarks, and notes
│   ├── roadmap.ts               # Roadmap graph and progress calculations
│   └── gemini.ts                # AI prompts and response handling
├── db/                          # Database access and schema
├── drizzle/                     # Database migrations
├── public/                      # Static assets
├── tests/                       # Automated roadmap tests
├── docs/                        # Setup, source map, and team guidance
├── scripts/ and build/          # Local runtime and build helpers
├── package.json                 # Dependencies and scripts
├── pnpm-lock.yaml               # Dependency lockfile
└── .env.example                 # Environment variable template
```

See [`docs/SOURCE_MAP.md`](docs/SOURCE_MAP.md) to find the implementation of each feature. The ZIP includes the actual files in their original folders; the tree above is a shortened guide.

## Tech stack

- TypeScript, React, and a Next.js-style app directory running through Vinext.
- Cloudflare Workers for the hosted application and Cloudflare D1 for saved data.
- Drizzle ORM and SQL migrations for database access.
- Gemini for AI roadmap generation and milestone advice.
- pnpm for dependency management.

## Run locally

Requires **Node.js 22.13 or newer** and **pnpm 11.25.0**.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` for the copy step. Local development uses `http://localhost:5173`. The catalog and assignments work without a Gemini key; AI generation requires your own server-side key. Saved encrypted AI connections also require a stable `AI_CONNECTION_ENCRYPTION_KEY` as explained in [`docs/SETUP.md`](docs/SETUP.md). Keep `.env.local` and real credentials out of Git.

## Checks

```sh
pnpm typecheck
pnpm test
pnpm build
```

For local database setup, API contracts, and migration commands, follow [`docs/SETUP.md`](docs/SETUP.md). The included source archive excludes dependencies, generated output, live credentials, and database contents.

## Deployment note

This source was built for Sites hosting on Cloudflare Workers with D1 and hosted sign-in. Uploading it to GitHub does not deploy it. Other hosting providers require adapting the Cloudflare bindings and identity integration.

## Author

Created by **Sejal Rai**.
