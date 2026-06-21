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
# Hardcoded service-role secret or key name with a value.
if printf '%s' "$content" | grep -qE 'service_role|SERVICE_ROLE_KEY'; then
  deny "Refused: '$file' is client code and references the Supabase service_role. The service-role key bypasses RLS and anything in the client bundle is public. Use the publishable/anon key client-side; keep service-role usage server-side only. See SUPABASE.md / GOVERNANCE.md."
fi
# Long hardcoded JWT (eyJ... .eyJ... ) — a pasted Supabase key.
if printf '%s' "$content" | grep -qE 'eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}'; then
  deny "Refused: '$file' appears to contain a hardcoded JWT/API key. Keys must come from VITE_ env vars (publishable/anon only), never be pasted into source. See SUPABASE.md."
fi
exit 0
