/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  // New Supabase publishable key (sb_publishable_…); replaces the legacy anon key.
  readonly VITE_SB_PUBLISHABLE_KEY: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
