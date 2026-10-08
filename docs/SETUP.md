# Setup and API Contract

## Commands

- pnpm dev: local development.
- pnpm typecheck: check TypeScript.
- pnpm test: graph and mocked AI integration tests.
- pnpm db:generate: generate schema migrations.
- pnpm build: build the application.

After building, apply each pending local D1 migration once:

    node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_worried_richard_fisk.sql

For portable local sign-in simulation, visit /signin-with-chatgpt?return_to=/ on the local development origin. Hosted sign-in is supplied by Sites.

## API

| Route | Input | Output |
| --- | --- | --- |
| GET /api/config | None | AI configuration and sign-in status; no keys |
| POST /api/ai-connection | key | saved and connection status; sign-in required |
| DELETE /api/ai-connection | None | removed and connection status; sign-in required |
| POST /api/generate | goal, currentSkills, hoursPerWeek, targetMonths | roadmap |
| POST /api/advice | roadmap, milestoneId | learning steps, weekend project and interview questions |
| POST /api/replan | roadmap, milestoneId, status | updated roadmap, remainingHours, weeks, readyIds |
| GET /api/roadmaps | Optional id query | current user's saved list or roadmap |
| POST /api/roadmaps | complete roadmap | saved and id |

Saved keys require sign-in and AI_CONNECTION_ENCRYPTION_KEY, a server-only 32-byte random key represented as 64 hex characters. The database stores only AES-GCM ciphertext bound to the owner's user ID; routes read and remove only the current user's connection. Keep the encryption secret stable. Replacing it requires users to remove and reconnect old credentials.

AI requests automatically reuse the signed-in user's saved key. Shared GEMINI_API_KEY requires sign-in and takes precedence. The legacy x-gemini-key header remains supported for an explicit session key. Keep keys out of source, URLs, logs and exports.

## Acceptance checks

1. Connect a real key and generate a roadmap for a specific role.
2. Change the industry and confirm projects and roles change.
3. Select different milestones and confirm dynamically generated advice.
4. Mark a prerequisite known: verify fewer hours, updated estimate and unlocked steps.
5. Undo the mark and verify the path restores.
6. Save, refresh and reopen under the same signed-in user.
7. Check that another user's list excludes the first user's roadmap.
8. Check phone layout, keyboard navigation and dialogs.
9. Test invalid input, key and quota failures without substituting the example.
10. Check exports and Git history for credentials.
11. Save a Gemini connection, reload, and generate without pasting again.
12. Remove a saved connection and confirm another user's connection remains intact.

Live Gemini calls, hosted database interactions and visual browser checks are not claimed by mocked tests.

## Second migration for saved AI connections

On a fresh local database, also apply the second committed migration after the first:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_useful_greymalkin.sql
```

For a source map and local startup instructions, see [SOURCE_MAP.md](SOURCE_MAP.md).
