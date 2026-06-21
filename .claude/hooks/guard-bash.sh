#!/usr/bin/env bash
# PreToolUse (Bash) — block force-pushes. Force-push can overwrite remote
# history and publish prematurely; the user controls when/how work lands.
set -uo pipefail
command -v jq >/dev/null 2>&1 || exit 0
input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)
[ -z "$cmd" ] && exit 0
if printf '%s' "$cmd" | grep -qE 'git[[:space:]]+push.*(--force([^-]|$)|--force-with-lease|[[:space:]]-f([[:space:]]|$)|[[:space:]]\+)'; then
  jq -n --arg r "Refused: force-push is blocked by policy (CLAUDE.md). It can overwrite remote history and publish prematurely. Use a normal 'git push'; if histories diverged, reconcile explicitly with the user first." \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
fi
exit 0
