#!/usr/bin/env bash
# PostToolUse (Write|Edit) — enforce "done means done" (CLAUDE.md Rule 1).
# Blocks if a just-written CODE file contains a leftover TODO/FIXME/HACK/XXX
# marker. Docs (.md) are exempt — they legitimately discuss these markers.
set -uo pipefail
command -v jq >/dev/null 2>&1 || exit 0
input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_response.filePath // empty' 2>/dev/null)
[ -z "$file" ] && exit 0
[ -f "$file" ] || exit 0
# Only police source code; skip markdown/docs and this hook dir.
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.sql|*.css) : ;;
  *) exit 0 ;;
esac
hits=$(grep -nE '(^|[^A-Za-z0-9_])(TODO|FIXME|HACK|XXX)([^A-Za-z0-9_]|$)' "$file" 2>/dev/null | head -20 || true)
[ -z "$hits" ] && exit 0
reason="Rule 1 (done means done): left unfinished markers in $file. Resolve these before treating the task as complete — finish the work or, if genuinely blocked, tell the user exactly what remains. Do not ship TODO/FIXME/HACK/XXX in code:
$hits"
jq -n --arg r "$reason" '{decision:"block", reason:$r}'
exit 0
