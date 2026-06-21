# Welcome to the Table

> Houston restaurant & store discovery with a first-class **Black-owned** filter —
> verified Black-owned spots, trending Houston favorites, community-vouched welcoming
> spaces, and the historic Black Wall Street districts that built them. The promise:
> everybody gets a seat at the table.

Brand name: Welcome to the Table
Searchable phrase / slogan: "a seat at the table"
Operator: Envision VirtualEdge Group LLC (Houston, TX)
Languages: English, Spanish, French
Install: a PWA — installable on iPhone, iPad, Android, Samsung, and Windows.

## What it does
- Discover restaurants and stores near you across Greater Houston (Houston, Pearland,
  Missouri City, Spring, Sugar Land, and surrounding areas), with a **Black-owned**
  badge and filter front-and-center.
- Verification status on every listing (community-reported vs owner-verified) and
  community-vouched "Welcome" (welcoming-space) badges.
- A heritage guide to Houston's historic Black business districts (Third Ward /
  Emancipation Avenue, Freedmen's Town, Independence Heights, Fifth Ward, and more).

## Key queries this site answers
- Black-owned restaurants in Houston
- Trending / best new Houston restaurants near me
- Black-owned stores and businesses in Houston
- Soul food and Southern food, Black-owned, near me
- Welcoming, community-vouched spots
- Historic Black Wall Street districts in Houston

## Notes for accuracy
- The `black_owned` flag carries a cited `source_url`; verification status is shown on
  every listing. "Welcome" badges are community testimony, not a safety guarantee.
- The site never labels any place or area as dangerous.

---

## Tech stack
- **Frontend:** React 19 + TypeScript + Vite 8, installable **PWA** (`vite-plugin-pwa`),
  i18n via `react-i18next` (en/es/fr).
- **Backend:** Supabase (Postgres + PostgREST). Deny-by-default RLS; the client uses the
  new **publishable** key (`sb_publishable_…`).
- **Tests:** Vitest.

## Run it locally
```bash
npm install
cp .env.example .env        # fill VITE_SUPABASE_URL + VITE_SB_PUBLISHABLE_KEY
npm run dev                 # dev server
```

| Script | Does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build (generates PWA manifest + icons) |
| `npm run preview` | Serve the production build |
| `npm test` | Run the Vitest suite |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm run lint` | ESLint |

## Project layout
- `src/lib/` — Supabase client + data access (`businesses.ts`, pure `businessMap.ts`).
- `src/routes/`, `src/components/` — UI (e.g. `Discover.tsx`, `BusinessCard.tsx`, badges).
- `supabase/migrations/` — schema (canonical). `supabase/seed.sql` — seed-of-record.
- `src/types/business.ts` — domain types, mirror the schema.

## Documentation
- **[PROJECT_STATE.md](PROJECT_STATE.md)** — living status + task tracker (read this first).
- **[SUPABASE.md](SUPABASE.md)** — DB access model (GRANT + RLS), API keys, CLI & migration ops.
- **[GOVERNANCE.md](GOVERNANCE.md)** — product/data rules.
- **[CLAUDE.md](CLAUDE.md)** — engineering rules + guidance for AI agents working in this repo.

## Database & migrations
The schema is applied to the live project; canonical migrations live in
`supabase/migrations/`. To manage migrations with the CLI, authorize it first —
`npx supabase login` then `npx supabase link --project-ref epucdixgdakvsogdasyc`
(see [SUPABASE.md](SUPABASE.md) §6e). Never put the Supabase **secret** key or the
Anthropic API key in client code — those are server-only.
