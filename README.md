# SpendSmart AI — Free AI Tool Spend Audit

SpendSmart AI helps startup founders and engineering managers find out if they're overpaying for AI tools like Cursor, Claude, ChatGPT, and GitHub Copilot — with an instant, free audit and real savings numbers. Built as a lead-generation asset for [Credex](https://credex.rocks).

> **Live URL:** https://your-deployed-url.vercel.app
> **Screenshots / Demo:** [30-second Loom walkthrough](https://loom.com/your-link-here)

---

## Screenshots

_(Add 3+ screenshots here after deploying)_

---

## Quick Start

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)
- An Anthropic API key
- A Resend account (free tier works)

### Run locally

```bash
git clone https://github.com/yourusername/credex-audit
cd credex-audit
npm install
cp .env.example .env.local
# Fill in your keys in .env.local
npm run dev
# Open http://localhost:3000
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel
# Set environment variables in Vercel dashboard matching .env.example
```

### Supabase Setup

Run these SQL statements in your Supabase SQL editor:

```sql
create table audits (
  id text primary key,
  result jsonb not null,
  created_at timestamptz default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_name text,
  role text,
  team_size int,
  audit_id text references audits(id),
  monthly_savings int,
  created_at timestamptz default now()
);
```

---

## Decisions

1. **Next.js over Vite/CRA** — Needed server-side API routes (Anthropic key can't be in browser), and SSR metadata for Open Graph share URLs. Next.js does both in one repo.

2. **Hardcoded audit rules over AI** — The assignment explicitly called this out. Rule-based logic is auditable, deterministic, and explainable to a finance person. AI would be a black box for math.

3. **Supabase over Postgres on Render** — Supabase's free tier includes auth, real-time, and a REST API we didn't need to build. Lower ops overhead for an MVP week.

4. **Honeypot over hCaptcha for abuse protection** — hCaptcha adds a UX barrier before value is shown. Honeypot is invisible, faster, and sufficient for MVP. Rate limiting provides a second layer.

5. **nanoid for audit IDs over UUID** — Shorter, URL-safe IDs make for cleaner share links (`/audit/V1StGXR8` vs `/audit/550e8400-e29b-41d4...`). Collision risk is negligible at MVP scale.
