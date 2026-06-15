import { createClient } from '@supabase/supabase-js';

// Reads from Vite env. Throws early if misconfigured — fail loud, never silently.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them.');
}

export const supabase = createClient(url, anonKey);
