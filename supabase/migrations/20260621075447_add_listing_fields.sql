-- Broaden the catalog to trending Houston spots with a first-class Black-owned
-- identifier, source provenance, neighborhood filter, and an image slot.
-- Applied to epucdixgdakvsogdasyc 2026-06-21 (version 20260621075447).
alter table businesses
  add column black_owned  boolean not null default false,
  add column neighborhood text,
  add column source_url   text,
  add column image_url    text;

-- Partial index: the "Black-owned" filter only needs the true rows.
create index businesses_black_owned_idx on businesses (black_owned) where black_owned;
