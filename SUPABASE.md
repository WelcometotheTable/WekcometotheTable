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
- **`migrations/001_init.sql` is the source of truth** referenced by
  `src/types/business.ts`. Keep the `Business` interface and the schema in sync.

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

### 6a. Migrations live in the WRONG place for the tooling
The schema is at **`migrations/001_init.sql`**. The Supabase CLI and the MCP
`db push` workflow only look in **`supabase/migrations/`** with timestamped
names (`YYYYMMDDHHMMSS_name.sql`). There is **no `supabase/` dir and no
`config.toml`** in this repo, so the standard `supabase db push` has nothing to
act on. To use the standard workflow, create `supabase/config.toml` (linked to
`epucdixgdakvsogdasyc`) and move/copy the SQL to
`supabase/migrations/<timestamp>_init.sql`.

### 6b. The MCP `apply_migration` truncates large migrations
Pushing the whole `001_init.sql` through a single `apply_migration` /
`execute_sql` call **truncates and fails** — the large `$$`-dollar-quoted
`nearby_businesses` function body is what trips it. **Do not push the whole file
in one MCP call.** Instead either:
- **Split into logical chunks** and apply each via `apply_migration`:
  1. extension + enums + table + indexes
  2. RLS enable/force + revoke + grant + policy
  3. the `nearby_businesses` function (on its own) + its grant
- **Or** use the Supabase CLI (`supabase db push`) / `psql` directly — these
  stream the file properly. NOTE: `supabase`, `psql`, and `npx supabase` were all
  **MISSING** in this Codespace; install before relying on them.

### 6c. The live database may be empty
As of last check the project had **0 migrations and 0 tables** — the schema had
never been applied. If `list_tables` is empty, the app is pointed at an empty DB:
apply the migration (per 6b) before debugging app data issues.

### 6d. App env wiring
`src/lib/supabase.ts` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
(fails loud if missing). `.env.example` ships them blank — fill `.env` with the
project URL and the **publishable/anon** key (never the service key in the
client).
