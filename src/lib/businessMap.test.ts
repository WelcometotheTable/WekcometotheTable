import { describe, it, expect } from 'vitest';
import { rowToBusiness, BUSINESS_COLUMNS, type BusinessRow } from './businessMap.ts';

// Tests the REAL mapping logic against real input — no mocks of the thing under test.
// (No Supabase import here, so this runs with zero env/network.)

const fullRow: BusinessRow = {
  id: 'b1',
  name: 'The Breakfast Klub',
  slug: 'the-breakfast-klub',
  category: 'restaurant',
  subtype: ['Breakfast', 'Soul Food'],
  price_tier: 2,
  address: '3711 Travis St, Houston, TX 77002',
  latitude: 29.7384707,
  longitude: -95.3804262,
  phone: '+1 713-528-8561',
  verification_status: 'verified',
  welcome_badge: true,
  buzzing: true,
  black_owned: true,
  neighborhood: 'Midtown',
  source_url: 'https://example.com/source',
  image_url: null,
};

describe('rowToBusiness', () => {
  it('maps snake_case DB columns to the camelCase domain shape', () => {
    const b = rowToBusiness(fullRow);
    expect(b).toEqual({
      id: 'b1',
      name: 'The Breakfast Klub',
      slug: 'the-breakfast-klub',
      category: 'restaurant',
      subtype: ['Breakfast', 'Soul Food'],
      priceTier: 2,
      address: '3711 Travis St, Houston, TX 77002',
      latitude: 29.7384707,
      longitude: -95.3804262,
      phone: '+1 713-528-8561',
      verificationStatus: 'verified',
      welcomeBadge: true,
      buzzing: true,
      blackOwned: true,
      neighborhood: 'Midtown',
      sourceUrl: 'https://example.com/source',
      imageUrl: null,
      distanceMiles: null,
    });
  });

  it('coalesces a null subtype to an empty array (never undefined)', () => {
    const b = rowToBusiness({ ...fullRow, subtype: null });
    expect(b.subtype).toEqual([]);
  });

  it('preserves nullable fields as null, not undefined', () => {
    const b = rowToBusiness({ ...fullRow, price_tier: null, phone: null, neighborhood: null });
    expect(b.priceTier).toBeNull();
    expect(b.phone).toBeNull();
    expect(b.neighborhood).toBeNull();
  });

  it('requests every column the Business shape needs (column list stays in sync)', () => {
    const requested = BUSINESS_COLUMNS.split(',');
    // Every snake_case key on a row must be in the SELECT list, or the mapper gets undefined.
    for (const key of Object.keys(fullRow)) {
      expect(requested).toContain(key);
    }
  });
});
