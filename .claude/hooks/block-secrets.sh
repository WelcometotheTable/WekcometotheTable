#!/usr/bin/env bash
# PreToolUse (Write|Edit) — block secrets from entering client code.
# The service-role key bypasses all RLS; anything in a VITE/client bundle is
# public. Denies writing a service-role reference or a hardcoded JWT into JS/TS
# source. SQL migrations may reference the `service_role` ROLE legitimately, and
# .env.example is a template — both are exempt.
set -uo pipefail
command -v jq >/dev/null 2>&1 || exit 0
input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
content=$(printf '%s' "$input" | jq -r '.tool_input.content // .tool_input.new_string // empty' 2>/dev/null)
[ -z "$file" ] && exit 0
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs) : ;;
  *) exit 0 ;;
esac
deny() {
  jq -n --arg r "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
  exit 0
}
# New-style Supabase SECRET key (sb_secret_…) — server-only, bypasses RLS.
if printf '%s' "$content" | grep -qE 'sb_secret_[A-Za-z0-9]'; then
  deny "Refused: '$file' is client code and contains a Supabase SECRET key (sb_secret_…). Secret keys bypass RLS and have full data access — server-only, never in a client bundle. Client code uses the publishable key (sb_publishable_…) via VITE_SB_PUBLISHABLE_KEY. See SUPABASE.md."
fi
# Legacy service_role (key or role name) hardcoded in client code.
if printf '%s' "$content" | grep -qE 'service_role|SERVICE_ROLE_KEY'; then
  deny "Refused: '$file' is client code and references the Supabase service_role. The service-role key bypasses RLS and anything in the client bundle is public. Use the publishable key client-side; keep service/secret usage server-side only. (Note: service_role is also a legacy key — prefer sb_secret_… on the server.) See SUPABASE.md / GOVERNANCE.md."
fi
# Long hardcoded JWT (eyJ... .eyJ... ) — a pasted legacy anon/service_role key.
if printf '%s' "$content" | grep -qE 'eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}'; then
  deny "Refused: '$file' appears to contain a hardcoded JWT/API key (likely a legacy Supabase key). Keys must come from VITE_ env vars (publishable key only), never pasted into source. See SUPABASE.md."
fi
exit 0
