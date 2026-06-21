#!/usr/bin/env bash
# UserPromptSubmit hook — re-inject the core engineering rules into context
# every turn. Counters rule-drift over long sessions: the model re-reads the
# non-negotiables on each prompt instead of relying on CLAUDE.md staying salient.
set -euo pipefail
cat <<'CONTEXT'
{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"ENGINEERING RULES (from CLAUDE.md — always in force):\n1. Done means done: no TODO/FIXME/HACK/stub/placeholder, no workarounds. Finish end-to-end or state exactly what remains.\n2. Do it right the first time — fix root causes, not symptoms.\n3. No skimming/assumptions: read files & docs fully; verify against real code/schema, never memory.\n4. Rate limits + error boundaries on every external call; fail loud, degrade gracefully.\n5. Lazy code: no redundant fetch/recompute; reuse, memoize.\n6. No deprecated dependencies.\n7. Build real tests, not mocks of the thing under test.\n8. AEO + SEO first-class on user-facing pages.\nSUPABASE: it AUTO-GRANTS anon/authenticated on new public tables — you MUST `revoke all` then minimal `grant` + an RLS policy to get deny-by-default. Never put the service-role key in client code. Never push the whole init migration in one MCP call (it truncates). See SUPABASE.md.\nDo not commit/push unless asked."}}
CONTEXT
