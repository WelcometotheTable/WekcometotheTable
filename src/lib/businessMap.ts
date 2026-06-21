import type { Business, BusinessCategory, VerificationLevel } from '../types/business.ts';

// Shape of a `businesses` row as PostgREST returns it (snake_case). Kept separate
// from the Supabase client so the pure mapper below is testable without env/network.
export interface BusinessRow {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly category: BusinessCategory;
  readonly subtype: readonly string[] | null;
  readonly price_tier: number | null;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly phone: string | null;
  readonly verification_status: VerificationLevel;
  readonly welcome_badge: boolean;
  readonly buzzing: boolean;
  readonly black_owned: boolean;
  readonly neighborhood: string | null;
  readonly source_url: string | null;
  readonly image_url: string | null;
}

// Columns to request — explicit (never `*`) so the wire payload is stable and minimal.
export const BUSINESS_COLUMNS =
  'id,name,slug,category,subtype,price_tier,address,latitude,longitude,phone,' +
  'verification_status,welcome_badge,buzzing,black_owned,neighborhood,source_url,image_url';

/** Map a snake_case DB row to the camelCase domain `Business`. Pure. */
export function rowToBusiness(r: BusinessRow): Business {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    category: r.category,
    subtype: r.subtype ?? [],
    priceTier: r.price_tier,
    address: r.address,
    latitude: r.latitude,
    longitude: r.longitude,
    phone: r.phone,
    verificationStatus: r.verification_status,
    welcomeBadge: r.welcome_badge,
    buzzing: r.buzzing,
    blackOwned: r.black_owned,
    neighborhood: r.neighborhood,
    sourceUrl: r.source_url,
    imageUrl: r.image_url,
    // distance is only meaningful for proximity results from nearby_businesses().
    distanceMiles: null,
  };
}
