# SUPABASE.md — Database governance & operations

> Read this before touching the database, writing a migration, or running any
> Supabase MCP/CLI command. It encodes rules that are **not** obvious from the
> code and that, if violated, silently expose data or fail to deploy.

Project ref: `epucdixgdakvsogdasyc` ("WelcometotheTable's Project", us-west-2, Postgres 17).

---

## 1. The access model — GRANT *and* RLS, never one alone

The Supabase Data API (PostgREST + pg_graphql) gates every request through **two
independent layers**. Both must pass:

1. **Grants** decide *whether* a Postgres role (`anon`, `authenticated`,
   `service_role`) can reach a table / view / function over the API at all.
2. **RLS policies** decide *which rows* that role may read or modify.

> Official docs: *"A table isn't reachable through the Data API unless you have
> granted a role privileges on it."* — Securing your API.
> *"RLS must always be enabled on any tables stored in an exposed schema. By
> default, this is the `public` schema."* — Row Level Security.

GRANT controls the table; RLS controls the rows. **Neither alone is enough.**

## 2. The critical nuance: Supabase is NOT deny-by-default

Raw Postgres is deny-by-default. **A default Supabase project is not.**

> Official docs: *"In default Supabase projects `anon` and `authenticated` start
> with identical default-privilege grants."*

Supabase ships `ALTER DEFAULT PRIVILEGES` so **newly created tables in `public`
are auto-granted to `anon`/`authenticated`**. A table you create with no GRANT
line is **already exposed** — RLS becomes the *only* thing between `anon` and
your rows. This is why Supabase's own advisor lints (0023, 0026, 0028, 0029)
exist.

**Therefore: to get genuine deny-by-default you must explicitly `REVOKE` first.**
It is not "Postgres is deny-by-default" — it is **"Supabase auto-grants, so you
must REVOKE to make it deny-by-default."**

## 3. The required pattern for EVERY table

Use this template for every new table. The `REVOKE` is **not** redundant — it
cancels Supabase's automatic default grant.

```sql
alter table <t> enable row level security;
alter table <t> force row level security;            -- defense in depth: owner is subject to RLS too
revoke all on <t> from anon, authenticated;          -- cancel Supabase's default grant
grant select on <t> to anon, authenticated;          -- minimal, explicit, read-only
-- + an RLS policy below, or anon/authenticated see ZERO rows
create policy "<name>" on <t> for select to anon, authenticated using (<predicate>);
-- writes stay service-role only (service key bypasses RLS, server-side only)
```

## 4. Project-specific governance rules (do not weaken without review)

- **Deny by default.** No table/view/function is public until it has BOTH an
  explicit `GRANT` to `anon`/`authenticated` AND a matching RLS policy.
- **`candidate` businesses are NEVER public.** The public read policy filters
  `verification_status <> 'candidate'`. Mirrors `badges.tsx`.
- **Ownership is community-verified.** No row reaches `verified` on the AI's word
  alone — that transition is a privileged (service-role) operation.
- **Writes are service-role only.** `anon`/`authenticated` get `SELECT` and
  nothing more. No GRANT widening without a matching policy and a review.
- **The Welcome badge is community testimony, not a safety guarantee.** Nothing
  in the schema labels any place or area as unsafe.
- **`supabase/migrations/20260621065454_init.sql` is the source of truth**
  referenced by `src/types/business.ts`. Keep the `Business` interface and the
  schema in sync.

## 5. Two leaks RLS does NOT stop

- **GraphQL introspection (lint 0026).** Even *with* RLS, if `anon` has `SELECT`,
  `pg_graphql` exposes the table's name, columns, and relationships via
  `/graphql/v1` introspection — RLS protects rows, not schema shape. If something
  must be undiscoverable before sign-in, **revoke `SELECT` from `anon`**; don't
  rely on RLS.
- **`SECURITY DEFINER` functions (lints 0028/0029).** A `SECURITY DEFINER` RPC
  callable by `anon`/`authenticated` runs as its owner and **bypasses RLS**.
  Keep API-exposed functions `SECURITY INVOKER` with `set search_path = public`
  (as `nearby_businesses` already is) so the caller's RLS still applies.

After any schema change, run `get_advisors` (security + performance) and resolve
ERROR/WARN lints before considering the change done.

---

## 6. Operational gotchas (learned the hard way)

### 6a. Migrations are now in the canonical CLI location
The schema lives at **`supabase/migrations/20260621065454_init.sql`** — one
complete migration, the source of truth. `supabase/config.toml` exists and the
Supabase CLI is installed as a dev-dependency (`npx supabase`). The old
`migrations/001_init.sql` location was removed (the CLI/`db push` only reads
`supabase/migrations/`). **Authorize the CLI before pushing** — see 6e.

### 6b. The MCP `apply_migration` truncates large migrations
This is why the schema was first applied in 3 chunks. Pushing the whole init
file through a single `apply_migration` / `execute_sql` call **truncates and
fails** — the large `$$`-dollar-quoted `nearby_businesses` function body is what
trips it. **Never push the whole file in one MCP call.** Prefer the CLI
(`supabase db push`, streams the file properly). If you must use MCP, split into
chunks: (1) extension+enums+table+indexes, (2) RLS+revoke+grant+policy, (3) the
function + its grant.

### 6c. Schema is applied (as of 2026-06-21) — and NOT truncated
The schema **has been applied** to `epucdixgdakvsogdasyc`. It was applied in three
chunks (`init_01_table_and_enums`, `init_02_rls_grants_policy`,
`init_03_nearby_businesses_rpc`) to dodge the MCP truncation bug — so the dashboard
shows **3 migration records**, each a fragment; that is NOT data loss. Verified
complete: `pg_get_functiondef(nearby_businesses)` returns the full function body,
`get_advisors(security)` returns **0 lints**, table `businesses` exists with RLS
forced, `anon`/`authenticated` have `SELECT` only, the candidate-excluding policy
is live, and the RPC is `EXECUTE` for anon/authenticated (not public). **0 rows.**

The local source is now a single complete file
(`supabase/migrations/20260621065454_init.sql`, named to match the first deployed
version). Once the CLI is authorized (6e), collapse the 3 remote records into it:
```sh
npx supabase migration repair --status reverted 20260621065501 20260621065513
npx supabase migration list   # remote and local now both show only 20260621065454
```
`migration repair` only edits the migration-history table, not the schema — safe.

### 6e. Authorizing the CLI (required before `db push`)
The CLI is installed (dev-dependency, `npx supabase`) but **auth is interactive —
the user must run it** (a token can't be hard-coded here):
```sh
npx supabase login                                   # opens browser / device flow
npx supabase link --project-ref epucdixgdakvsogdasyc # prompts for DB password
npx supabase migration list                          # confirm local ↔ remote sync
```
For CI / headless, set `SUPABASE_ACCESS_TOKEN` instead of `login`. After linking,
`supabase db push` applies new `supabase/migrations/*.sql` files — properly streamed,
no truncation. Never commit the access token or DB password.

### 6d. App env wiring
`src/lib/supabase.ts` reads `VITE_SUPABASE_URL` and `VITE_SB_PUBLISHABLE_KEY`
(fails loud if missing). `.env.example` ships them blank — fill `.env` with the
project URL and the **publishable** key (see section 7). Never put the secret key
in the client.

## 7. API keys — use the NEW publishable/secret keys (keys ≠ roles)

The legacy API keys named `anon` and `service_role` are **deprecated** (they keep
working until end of 2026, but don't build on them — Rule 6). Use the new keys:

| Legacy key | New key | Format | Where |
|---|---|---|---|
| `anon` | **publishable** | `sb_publishable_…` | client/browser — `VITE_SB_PUBLISHABLE_KEY` |
| `service_role` | **secret** | `sb_secret_…` | server/Edge Functions only — NEVER in client |

- The publishable key has the **same low (anon-role) privileges** as the old anon
  key, so RLS behaves identically. The secret key bypasses RLS, returns HTTP 401
  if used in a browser, and is not a JWT.
- **CRITICAL — keys are not roles.** This deprecation is ONLY about the
  client-facing API keys. The Postgres **roles** `anon`, `authenticated`,
  `service_role` are NOT deprecated — they're what every `grant`/`revoke`/RLS
  policy in this repo targets, and the publishable key still authenticates *as*
  the `anon` role. **Do not rewrite the migration SQL** when "removing deprecated
  keys" — the role references in the init migration are correct and must stay.
- This is a Vite SPA with no backend, so it only uses the publishable key. Get keys
  from Dashboard → Settings → API Keys (publishable + secret tab). Source:
  https://supabase.com/docs/guides/getting-started/api-keys
