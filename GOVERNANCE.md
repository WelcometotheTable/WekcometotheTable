# Governance

Non-negotiable rules for Welcome to the Table. Code and database must respect these.

## Data access (Supabase / Postgres)

- **Deny by default — but only because we REVOKE.** Supabase *auto-grants*
  `anon`/`authenticated` on new `public` tables, so a table is NOT private until
  we explicitly `revoke all` then `grant` the minimum. Once revoked, a table or
  function is exposed over the public (PostgREST) API only when there is **both**
  an explicit `GRANT` to the `anon` role **and** a row-level-security policy that
  admits the row. We never rely on implicit exposure. See
  [`supabase/migrations/20260621065454_init.sql`](supabase/migrations/20260621065454_init.sql)
  and, for the full model and ops notes, [`SUPABASE.md`](SUPABASE.md).
- **Least privilege.** `anon` and `authenticated` get `SELECT` only. All writes
  (insert/update/delete, and any promotion of `verification_status`) are
  service-role operations performed server-side, never from the client.
- **RLS is forced** on `businesses` (`force row level security`) so even the
  table owner is subject to policy — defense in depth.
- Every new table/function/RPC must ship in the same migration as its `GRANT`
  and its RLS policy. A grant without a policy (or vice versa) is a bug.

## Listing integrity

> Rigor calibrated to a **public consumer directory** — names/addresses are public
> info, not PHI. Keep the security baseline above; the publishing workflow is light.

- **`candidate` = unvetted submissions** (e.g. raw user adds), hidden by RLS until
  reviewed. `community` and `verified` rows are public.
- **Real, cited listings may be seeded as `community` (visible).** Automated/AI
  ingestion of publicly-documented businesses is fine — store a `source_url` for the
  claim (especially the `black_owned` flag). This is reasonable diligence, not a
  verification ceremony.
- **`verified` means owner-confirmed** (an owner claim, or strong community
  confirmation) — a meaningful, privileged step above `community`. Reserve it.
- **The Welcome badge is community testimony, not a safety guarantee.** Nothing
  in the product labels any place or area as unsafe.

## Applying the schema

The migration lives at `supabase/migrations/20260621065454_init.sql` and is
**already applied** to the live project (`epucdixgdakvsogdasyc`). Future changes go
through the authorized Supabase CLI:

```bash
npx supabase db push   # applies new supabase/migrations/*.sql (no MCP truncation)
```

CLI authorization and migration-history reconciliation are documented in
[`SUPABASE.md`](SUPABASE.md) §6e / §6c.
