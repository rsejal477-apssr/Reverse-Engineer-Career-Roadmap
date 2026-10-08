# Three Person Work Ownership

| Person | Ownership | Files |
| --- | --- | --- |
| Person 1 | Frontend, graph, milestone panel, mobile and keyboard UX | app/roadmapper.tsx, app/globals.css, app/layout.tsx, public/ |
| Person 2 | AI prompts, structured output, validation and scheduling | lib/roadmap.ts, lib/gemini.ts, app/api/generate/, app/api/advice/, app/api/replan/ |
| Person 3 | Database, sign-in, deployment and acceptance checks | db/, drizzle/, app/api/roadmaps/, app/api/config/, docs/, README.md |

The shared contract lives in lib/roadmap.ts. Agree on changes before editing callers.

Person 1 next: inspect desktop/mobile layout and keyboard selection; test graph controls, modal focus and completion states.

Person 2 next: connect an authorised Gemini key and try a fintech designer, a climate-tech developer and an embedded systems internship goal. Check that projects and roles differ meaningfully. Verify dynamic advice and invalid-key handling.

Person 3 next: verify save/load under sign-in, prepare the public GitHub submission, organise the PPT and record a backup demo.

Three-minute demo: enter a specific goal, generate a live roadmap, click a milestone for advice, mark a skill as known, show updated next steps and timeline, then save.

Do not use the example as evidence of live AI generation. Use real observations in the README and presentation.
