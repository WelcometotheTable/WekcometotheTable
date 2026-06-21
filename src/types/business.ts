// Domain types — mirror the Supabase schema (supabase/migrations/20260621065454_init.sql).
// Kept hand-authored and strict; regenerate with `npx supabase gen types typescript`.

export type BusinessCategory = 'restaurant' | 'store';
export type VerificationLevel = 'candidate' | 'community' | 'verified';

export interface Business {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly category: BusinessCategory;
  readonly subtype: readonly string[];
  readonly priceTier: number | null;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly phone: string | null;
  readonly verificationStatus: VerificationLevel;
  /** Community-attested welcoming space (Green Book model). Testimony, never a safety guarantee. */
  readonly welcomeBadge: boolean;
  /** Trending from social signal + review velocity. Trending is never a substitute for verification. */
  readonly buzzing: boolean;
  /** Miles from the query point; present only on results from nearby_businesses(). */
  readonly distanceMiles: number | null;
}
