import { createClient } from '@supabase/supabase-js';

// Reads from Vite env. Throws early if misconfigured — fail loud, never silently.
// Uses the new Supabase PUBLISHABLE key (sb_publishable_…), which replaces the
// legacy anon key. It carries the same low (anon-role) privileges, so RLS is
// unchanged. The secret key (sb_secret_…) is server-only and must NEVER appear
// in this client bundle. See SUPABASE.md.
const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SB_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SB_PUBLISHABLE_KEY. Copy .env.example to .env and fill them.');
}

export const supabase = createClient(url, publishableKey);
