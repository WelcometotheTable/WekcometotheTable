# Governance

Non-negotiable rules for Welcome to the Table. Code and database must respect these.

## Data access (Supabase / Postgres)

- **Nothing is public by default.** Supabase exposes a table or function over the
  public (PostgREST) API only when there is **both** an explicit `GRANT` to the
  `anon` role **and** a row-level-security policy that admits the row. We never
  rely on implicit exposure. See [`migrations/001_init.sql`](migrations/001_init.sql).
- **Least privilege.** `anon` and `authenticated` get `SELECT` only. All writes
  (insert/update/delete, and any promotion of `verification_status`) are
  service-role operations performed server-side, never from the client.
- **RLS is forced** on `businesses` (`force row level security`) so even the
  table owner is subject to policy — defense in depth.
- Every new table/function/RPC must ship in the same migration as its `GRANT`
  and its RLS policy. A grant without a policy (or vice versa) is a bug.

## Listing integrity

- **Candidates are never shown publicly.** Only `community` and `verified`
  rows are returned to clients (enforced by RLS policy, mirrored in `badges.tsx`).
- **AI never auto-publishes.** A business reaches `verified` only via an owner
  claim or 3+ independent community confirmations — a privileged transition.
- **The Welcome badge is community testimony, not a safety guarantee.** Nothing
  in the product labels any place or area as unsafe.

## Applying the schema

The migration is recorded in the repo but **not** auto-applied to any live
project. Apply it deliberately:

```bash
# Supabase CLI (rename into supabase/migrations/ with a timestamp first), or
psql "$DATABASE_URL" -f migrations/001_init.sql
```
