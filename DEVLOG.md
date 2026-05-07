# Dev Log

## Day 1 — 2025-05-07

**Hours worked:** 3

**What I did:** Read the assignment twice and made notes. Drew the data 
flow on paper — user input → audit engine → Supabase → results page. 
Scaffolded the Next.js project, set up Tailwind, pushed first commit. 
Created Supabase project and ran the SQL to create audits and leads tables.

**What I learned:** nanoid v5 is ESM-only which breaks ts-jest by default. 
Had to add a manual mock at __mocks__/nanoid.ts. Took 40 minutes to figure out.

**Blockers / what I'm stuck on:** Not sure how granular the per-tool audit 
rules need to be. Will start with the clearest cases (wrong plan for team 
size) and add more after.

**Plan for tomorrow:** Build the spend input form and wire it to localStorage 
persistence. Start the audit engine for Cursor and GitHub Copilot.
