# PROJECT_STATE.md — Welcome to the Table

> **Living status + task tracker.** Single source of truth for *what's done, what's
> left, and where we are*. Update it in the same change that alters project state —
> a stale tracker is worse than none (Rule 1). Dates are absolute. Last updated:
> **2026-06-21**.

Companion docs: [`CLAUDE.md`](CLAUDE.md) (engineering rules + AI guardrails),
[`SUPABASE.md`](SUPABASE.md) (DB access model + ops), [`GOVERNANCE.md`](GOVERNANCE.md)
(product rules). Hooks in `.claude/` enforce the rules deterministically.

---

## 1. What this is

A guide to **verified Black-owned restaurants and stores across Greater Houston** —
community-vouched welcoming spaces (a "Welcome badge", Green Book model) and the
historic Black Wall Street districts. **Installable PWA** (iPhone, iPad, Android,
Samsung, Windows) with Web Push. React 19 + Vite 8 SPA, Supabase Postgres backend,
plus a planned Claude-powered AI layer ("Claude in Claude"). i18n: English, Spanish,
French. Verification is community-attested; AI never auto-publishes.

## 2. Status at a glance

| Area | State | Notes |
|---|---|---|
| Repo health / push | ✅ Done | Was never blocked — commits just weren't pushed. In sync with `origin/main`. |
| Build / typecheck | ✅ Green | `npm run build`, `tsc -b --noEmit` pass. |
| DB schema | ✅ Applied & verified | 3 migrations on `epucdixgdakvsogdasyc`, 0 advisor lints, deny-by-default proven. |
| DB governance docs + hooks | ✅ Done | SUPABASE.md, GOVERNANCE.md, CLAUDE.md, 4 enforcement hooks (proven firing). |
| App ↔ Supabase wiring | 🟡 Code ready, unconfigured | Uses new `VITE_SB_PUBLISHABLE_KEY`; `.env` still blank. |
| Seed data | ⛔ Not started | `businesses` table has 0 rows. |
| **Test infrastructure** | ⛔ **Not started (top blocker)** | No Vitest, no `test` script, no tests. The "tests pass 100%" rule has nothing to run yet. |
| PWA installability | ✅ Done & verified | Real PNG icons (192/512/maskable) + apple-touch + iOS meta. Installable on iPhone/iPad/Android/Samsung/Windows. Build-verified. |
| Web Push (VAPID) | ⛔ Not started | Env scaffolded; needs custom SW + subscriptions table + sender. See §4. |
| Anthropic / Claude AI layer | ⛔ Not started | Architecture decided (see §4); not built. |
| Supabase CLI workflow | 🟡 Set up, **needs auth** | CLI installed (dev-dep), `config.toml` + single canonical migration in place. Interactive `supabase login`/`link` is on the user (see §3). |
| AEO / SEO | 🟡 Partial | FAQ JSON-LD + meta/OG present; needs `LocalBusiness` JSON-LD, sitemap, per-route titles. |

Legend: ✅ done & verified · 🟡 in progress / partial · ⛔ not started · 🚧 blocked.

## 3. Task tracker

### Now / next
- [ ] **Set up test infrastructure (Vitest).** Add `vitest` + `@testing-library/react`,
  a `test` script, and first real tests for `src/lib/supabase.ts` and the data layer.
  Until this exists, Rule 7 ("tests pass 100%, no skips") is unenforceable. **Highest
  priority** — blocks meaningful "done."
- [ ] **Fill `.env`** with real `VITE_SUPABASE_URL` + `VITE_SB_PUBLISHABLE_KEY`
  (publishable key from Dashboard → Settings → API Keys). Can fetch URL + publishable
  key via Supabase MCP on request.
- [ ] **Seed `businesses`.** Write a seed migration from `src/data/sampleBusinesses.ts`
  (candidates stay hidden by the RLS policy, as designed).

### Web Push / VAPID (see §4 for architecture)
- [ ] Generate VAPID keypair (`npx web-push generate-vapid-keys`); set `VAPID_PRIVATE_KEY`
  + `VAPID_SUBJECT` (server secrets) and `VITE_VAPID_PUBLIC_KEY` (client).
- [ ] Switch vite-plugin-pwa from `generateSW` to **`injectManifest`** (or add a custom SW)
  so a `push` + `notificationclick` handler can be added — Workbox's generated SW has none.
- [ ] `push_subscriptions` table (endpoint + keys) with RLS: a user manages only their own.
- [ ] Client: request permission, `pushManager.subscribe({applicationServerKey})`, persist sub.
- [ ] Edge Function sender using `web-push` + the private VAPID key (server-only).
- [ ] Note: iOS supports Web Push **only for an installed PWA on iOS 16.4+** — gate the UI.

### Claude AI layer (see §4 for architecture)
- [ ] Create Supabase Edge Function `claude-proxy` holding `ANTHROPIC_API_KEY` server-side.
- [ ] Implement the call: model `claude-opus-4-8`, `thinking:{type:"adaptive"}`, streaming.
- [ ] Client calls the Edge Function (never Anthropic directly); add error boundary +
  rate-limit/debounce (Rule 4).
- [ ] Tests for the proxy against a real call (Rule 7).

### Infrastructure / hardening
- [x] Supabase CLI installed (dev-dep) + `supabase init` (`config.toml`) + single canonical
  migration `supabase/migrations/20260621065454_init.sql` (old fragmented `migrations/` removed).
- [ ] **Authorize the CLI (user action — interactive).** Run:
  `npx supabase login` → `npx supabase link --project-ref epucdixgdakvsogdasyc`.
- [ ] After link, reconcile remote history to the single migration:
  `npx supabase migration repair --status reverted 20260621065501 20260621065513`
  then `npx supabase migration list` to confirm local ↔ remote in sync.
- [ ] AEO/SEO pass: per-page `<title>`/meta/OG, canonical, `LocalBusiness` JSON-LD,
  accurate `public/llms-full.txt` + robots + sitemap (Rule 8).
- [ ] Add a CI check (build + typecheck + test) once tests exist.

### Done (this session, 2026-06-21)
- [x] Diagnosed "push failure" (nothing blocked; pushed 4 commits).
- [x] Applied DB schema in 3 chunks (dodged MCP truncation); verified deny-by-default; 0 advisor lints.
- [x] Authored SUPABASE.md, fixed GOVERNANCE.md, authored CLAUDE.md (rules + error table + AI-failure-modes table).
- [x] Added 4 enforcement hooks (rules reminder, TODO-blocker, secret-blocker, force-push guard); proven firing.
- [x] Migrated app off the deprecated anon key → publishable key (`VITE_SB_PUBLISHABLE_KEY`); tsc green.
- [x] Made the PWA truly installable cross-device: generated PNG icons (64/192/512 + maskable
  + apple-touch-180 + favicon) from `icon.svg` via `@vite-pwa/assets-generator`; added iOS
  standalone meta; manifest `id`/`categories`/`orientation`. Build-verified.

## 4. Architecture decisions

- **DB access:** deny-by-default via explicit `REVOKE` then minimal `GRANT` + RLS.
  Supabase auto-grants new `public` tables, so the REVOKE is load-bearing. See SUPABASE.md.
- **API keys:** new Supabase keys — publishable (`sb_publishable_…`, client) and secret
  (`sb_secret_…`, server). Legacy anon/service_role *keys* are deprecated; the Postgres
  *roles* are not. Never rewrite migration SQL when swapping keys.
- **PWA — DECISION:** icons are generated from `public/icon.svg` by
  `@vite-pwa/assets-generator` (`minimal-2023` preset) at build, not committed as
  binaries — `icon.svg` + `vite.config.ts` are the source of truth. Manifest is
  generated (`dist/manifest.webmanifest`); there is intentionally no static
  `public/manifest.json`. iOS needs the `apple-touch-icon` PNG + `apple-mobile-web-app-*`
  meta (Safari ignores the manifest icons/display) — both are in place.
- **Web Push (VAPID) — DECISION:** public key → `VITE_VAPID_PUBLIC_KEY` (safe in browser,
  it's the `applicationServerKey`); private key → `VAPID_PRIVATE_KEY` (Edge Function only,
  never `VITE_`). Adding a `push`/`notificationclick` handler requires switching the PWA
  plugin to `injectManifest` (the default `generateSW`/Workbox SW has no push handler).
  Subscriptions live in a `push_subscriptions` table (RLS: own-rows-only); the Edge Function
  sends via `web-push`. iOS only delivers push to an **installed** PWA (16.4+).
- **Claude/Anthropic ("Claude in Claude") — DECISION:** a Vite SPA **cannot** call the
  Anthropic API directly — `ANTHROPIC_API_KEY` is a secret and anything in the bundle is
  public. All Claude calls go through a **Supabase Edge Function proxy** that holds the key
  server-side (set via `supabase secrets set`). Defaults: model **`claude-opus-4-8`**,
  `thinking:{type:"adaptive"}`, **streaming** for any long output. The `block-secrets`
  hook already denies `sb_secret_…`/`service_role` in client code; do the same vigilance
  for `ANTHROPIC_API_KEY` — it belongs only in the Edge Function. AI output is advisory;
  it never sets `verification_status` to `verified` (that's a privileged, community-gated
  transition — GOVERNANCE.md).

## 5. Open decisions (need input)

- Real Supabase `.env` values: fetch via MCP, or will you paste them?
- Seed scope: ship all of `sampleBusinesses.ts`, or a curated subset?
- Claude AI feature scope: what should the AI layer actually *do* first (e.g. summarize
  reviews, draft listing descriptions, answer "is X welcoming?")? This drives the Edge
  Function's prompt + tool surface.
- Web Push scope: what triggers a notification (new verified business nearby, an owner
  claim approved, a "buzzing" spot)? Determines the sender's triggers and copy.

## 6. How to keep this current

When you finish or start a task: flip its box, move it between §3 buckets, and bump the
"Last updated" date. When a decision in §4 changes, edit it there (don't append). This
file is read by the next session before acting — keep it true.
