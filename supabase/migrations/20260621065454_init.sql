-- Welcome to the Table — initial schema + governance.
-- This file is the SOURCE OF TRUTH referenced by src/types/business.ts.
-- Keep the Business interface and this schema in sync.
--
-- GOVERNANCE — READ BEFORE EDITING
-- ----------------------------------------------------------------------------
-- 1. Postgres/Supabase exposes NOTHING to the public (PostgREST) API by default.
--    A table is only reachable by the `anon` role if it has BOTH:
--      (a) an explicit GRANT to `anon`, AND
--      (b) a row-level-security policy that permits the row.
--    Supabase AUTO-GRANTS new public tables to anon/authenticated, so we REVOKE
--    defaults first, then grant the minimum surface, on purpose. Do not widen a
--    grant without a matching policy and a review. See SUPABASE.md.
-- 2. `candidate` businesses are NEVER shown publicly (mirrors badges.tsx).
-- 3. Ownership is community-verified. No row reaches `verified` on AI's word
--    alone — that transition is a privileged (service-role) operation.
-- 4. The Welcome badge is community testimony, NOT a safety guarantee. Nothing
--    in this schema labels any place or area as unsafe.
-- ----------------------------------------------------------------------------

create extension if not exists "uuid-ossp";

-- Domain enums — mirror src/types/business.ts ------------------------------------
create type business_category as enum ('restaurant', 'store');
create type verification_level as enum ('candidate', 'community', 'verified');

-- Core table --------------------------------------------------------------------
create table businesses (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  slug                text not null unique,
  category            business_category not null,
  subtype             text[] not null default '{}',
  price_tier          smallint check (price_tier between 1 and 4),
  address             text not null,
  latitude            double precision not null,
  longitude           double precision not null,
  phone               text,
  verification_status verification_level not null default 'candidate',
  -- Community-attested welcoming space (Green Book model). Testimony, never a safety guarantee.
  welcome_badge       boolean not null default false,
  -- Trending from social signal + review velocity. Never a substitute for verification.
  buzzing             boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index businesses_category_idx on businesses (category);
create index businesses_verification_idx on businesses (verification_status);
create index businesses_geo_idx on businesses (latitude, longitude);

-- Row-Level Security ------------------------------------------------------------
alter table businesses enable row level security;
-- Force RLS so even the table owner is subject to policies (defense in depth).
alter table businesses force row level security;

-- Explicit, minimal grants. Cancel Supabase's default auto-grant, then grant
-- read-only. Nothing is public until both this GRANT and the policy below allow it.
revoke all on businesses from anon, authenticated;
grant select on businesses to anon, authenticated;
-- Writes are service-role only (bypasses RLS via the secret/service key, server-side).

-- Public read policy: candidates are never exposed publicly.
create policy "public reads non-candidate businesses"
  on businesses for select
  to anon, authenticated
  using (verification_status <> 'candidate');

-- Proximity search RPC ----------------------------------------------------------
-- SECURITY INVOKER (default) so the caller's RLS still applies — the function
-- cannot leak candidate rows. Returned distance_miles maps to Business.distanceMiles.
create or replace function nearby_businesses(
  in_lat    double precision,
  in_lng    double precision,
  in_radius double precision default 10  -- miles
)
returns table (
  id                  uuid,
  name                text,
  slug                text,
  category            business_category,
  subtype             text[],
  price_tier          smallint,
  address             text,
  latitude            double precision,
  longitude           double precision,
  phone               text,
  verification_status verification_level,
  welcome_badge       boolean,
  buzzing             boolean,
  distance_miles      double precision
)
language sql
stable
security invoker
set search_path = public
as $$
  -- Haversine (3958.8 = Earth radius in miles). No PostGIS dependency.
  select
    b.id, b.name, b.slug, b.category, b.subtype, b.price_tier, b.address,
    b.latitude, b.longitude, b.phone, b.verification_status,
    b.welcome_badge, b.buzzing,
    3958.8 * 2 * asin(sqrt(
      power(sin(radians(b.latitude - in_lat) / 2), 2) +
      cos(radians(in_lat)) * cos(radians(b.latitude)) *
      power(sin(radians(b.longitude - in_lng) / 2), 2)
    )) as distance_miles
  from businesses b
  where 3958.8 * 2 * asin(sqrt(
      power(sin(radians(b.latitude - in_lat) / 2), 2) +
      cos(radians(in_lat)) * cos(radians(b.latitude)) *
      power(sin(radians(b.longitude - in_lng) / 2), 2)
    )) <= in_radius
  order by distance_miles asc;
$$;

-- Function execution is also explicit-grant-only.
revoke all on function nearby_businesses(double precision, double precision, double precision) from public;
grant execute on function nearby_businesses(double precision, double precision, double precision) to anon, authenticated;
