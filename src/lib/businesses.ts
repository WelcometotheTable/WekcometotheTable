import { supabase } from './supabase.ts';
import type { Business } from '../types/business.ts';
import { BUSINESS_COLUMNS, rowToBusiness, type BusinessRow } from './businessMap.ts';

/**
 * Fetch publicly-visible businesses. RLS returns only `community`/`verified` rows
 * (candidates stay hidden). Throws a clear error on failure — callers render an
 * error state (fail loud, degrade gracefully).
 */
export async function fetchBusinesses(): Promise<Business[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select(BUSINESS_COLUMNS)
    .order('name', { ascending: true })
    .returns<BusinessRow[]>();

  if (error) {
    throw new Error(`Failed to load businesses: ${error.message}`);
  }
  return (data ?? []).map(rowToBusiness);
}
