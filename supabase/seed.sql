-- Production seed — real, cited Houston businesses (coordinates verified via
-- OpenStreetMap/Nominatim or known sources). Idempotent on slug. Run automatically
-- by `supabase db reset`; also applied to the live project on 2026-06-21.
-- Consumer-directory policy (GOVERNANCE.md): cited public listings are `community`
-- (visible); `verified` = owner-confirmed. black_owned carries a source_url.
insert into businesses
  (name, slug, category, subtype, price_tier, address, latitude, longitude, phone,
   verification_status, welcome_badge, buzzing, black_owned, neighborhood, source_url)
values
  ('The Breakfast Klub', 'the-breakfast-klub', 'restaurant', array['Breakfast','Soul Food'], 2,
   '3711 Travis St, Houston, TX 77002', 29.7384707, -95.3804262, '+1 713-528-8561',
   'verified', true, true, true, 'Midtown',
   'https://www.theinfatuation.com/houston/guides/best-black-owned-restaurants-houston'),

  ('Lucille''s', 'lucilles', 'restaurant', array['Southern','Seafood','Brunch'], 2,
   '5512 La Branch St, Houston, TX 77004', 29.7238227, -95.3850641, '+1 713-568-2505',
   'verified', true, false, true, 'Museum District',
   'https://www.theinfatuation.com/houston/guides/best-black-owned-restaurants-houston'),

  ('Mikki''s Soul Food Cafe', 'mikkis-soul-food-cafe', 'restaurant', array['Soul Food','Seafood'], 2,
   '2712 Blodgett St, Houston, TX 77004', 29.7230128, -95.3697263, '+1 713-485-4850',
   'community', false, false, true, 'Third Ward',
   'https://www.theinfatuation.com/houston/guides/best-black-owned-restaurants-houston'),

  ('Lost & Found', 'lost-and-found', 'restaurant', array['Bar & Grill','Brunch'], 2,
   '160 W Gray St, Houston, TX 77019', 29.7534725, -95.3809497, '+1 832-649-3050',
   'community', true, false, false, 'Fourth Ward',
   'https://www.houstoniamag.com/eat-and-drink/new-restaurants-houston'),

  ('Peachez HTX', 'peachez-htx', 'restaurant', array['Southern','Bar'], 2,
   '2553 Southmore Blvd, Houston, TX 77004', 29.7201542, -95.3736237, null,
   'community', false, false, true, 'Third Ward',
   'https://www.houstononthecheap.com/black-owned-restaurants-houston/'),

  ('Reggae Hut', 'reggae-hut', 'restaurant', array['Caribbean'], 2,
   '4814 Almeda Rd, Houston, TX 77004', 29.7265514, -95.3776957, null,
   'community', false, false, true, 'Third Ward',
   'https://www.houstononthecheap.com/black-owned-restaurants-houston/'),

  ('Mo'' Brunch and Brews', 'mo-brunch-and-brews', 'restaurant', array['Vegan','Brunch'], 2,
   '1201 Southmore Blvd, Houston, TX 77004', 29.7274770, -95.3855490, null,
   'community', false, false, true, 'Third Ward',
   'https://www.houstononthecheap.com/black-owned-restaurants-houston/'),

  ('A''dor Kitchen & Cocktail', 'ador-kitchen-and-cocktail', 'restaurant', array['Brunch','Lounge'], 2,
   '403 West Gray St, Houston, TX 77019', 29.7533510, -95.3865935, null,
   'community', false, false, true, 'Fourth Ward',
   'https://www.theinfatuation.com/houston/guides/best-black-owned-restaurants-houston')
on conflict (slug) do nothing;
