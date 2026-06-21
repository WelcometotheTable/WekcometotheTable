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
  /** First-class identifier for Black-owned businesses (badge + filter). Backed by sourceUrl. */
  readonly blackOwned: boolean;
  /** Neighborhood / district (e.g. "Third Ward", "Midtown"). Filter dimension. */
  readonly neighborhood: string | null;
  /** Provenance for the listing / the blackOwned claim — a cited public source. */
  readonly sourceUrl: string | null;
  /** Listing photo. Nullable until the licensed-image source (e.g. Google Places) is wired. */
  readonly imageUrl: string | null;
  /** Miles from the query point; present only on results from nearby_businesses(). */
  readonly distanceMiles: number | null;
}
