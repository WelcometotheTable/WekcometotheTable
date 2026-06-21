# CLAUDE.md

Guidance for Claude Code working in this repo.

## Before touching the database

**Read [`SUPABASE.md`](SUPABASE.md) first.** It is the source of truth for the
Supabase access model (GRANT + RLS), the project-specific governance rules, and
the operational gotchas (migrations live in `migrations/` not `supabase/`; the
MCP `apply_migration` truncates the large init migration — split it; the live DB
may be empty). Do not write a migration or run a Supabase MCP/CLI command without
it.

Key rule to never forget: **Supabase auto-grants `anon`/`authenticated` on new
`public` tables — you must explicitly `REVOKE` then `GRANT` to get
deny-by-default.** "Nothing is public by default" is only true *after* you
REVOKE.

See also [`GOVERNANCE.md`](GOVERNANCE.md) for the non-negotiable product rules.

## Engineering rules (non-negotiable)

These are binding directives, not aspirations. This document is written to be read
**in full by an AI agent** — do not skim it, do not pattern-match a few headings and
move on. Read every rule and apply it. If a rule conflicts with a shortcut you were
about to take, the rule wins.

1. **Done means done.** A task is complete only when it fully works end-to-end in
   the real system. No shortcuts. No workarounds. No `TODO`, `FIXME`, `HACK`,
   placeholder, stub, "left as an exercise", or "wire this up later" left behind. If
   you cannot finish it, say so explicitly and state exactly what remains — never
   present partial work as complete.

2. **Do it right the first time.** There is time to do it right; there is not time
   to do it twice. Prefer the correct, durable solution over the fast one. Do not
   hardcode what should be configurable, do not paper over a root cause, do not
   patch a symptom. When two approaches exist, choose the one you won't have to redo.

3. **No skimming, no assumptions.** Read files fully before editing them. Read this
   doc, `SUPABASE.md`, and `GOVERNANCE.md` fully before doing related work. Verify
   against the actual code/schema/docs — never assert from memory or guess at an API.

4. **Rate limits and error boundaries where needed.** Every external call (Supabase,
   third-party APIs, network I/O) must handle failure: timeouts, retries with
   backoff where appropriate, and explicit error handling — never a silent catch or
   an unhandled rejection. UI must have React error boundaries so one failure does
   not blank the app. Rate-limit/debounce/throttle anything that can be called in a
   loop or by user input (search, geolocation, autocomplete). Fail loud, degrade
   gracefully.

5. **Lazy code works the hardest.** Be lazy in the disciplined sense: do the least
   work at runtime. No redundant fetches, no recomputation of what can be memoized,
   no work done eagerly that could be deferred or cached. Reuse existing code and
   utilities instead of duplicating them. The best code is the code you didn't make
   the machine run twice.

6. **No deprecated dependencies.** Do not add, keep, or build on deprecated packages,
   APIs, or patterns. Use current, supported versions and current APIs. If you hit a
   deprecation warning, resolve it — don't suppress it. Check before adding a dep.

7. **Build tests, not mocks.** Write real tests that exercise real behavior against
   the real system (or a real local Supabase/db) wherever feasible. Do not mock away
   the thing under test to make a test pass. A test that mocks the behavior it claims
   to verify is worse than no test. Prefer integration/E2E coverage for data-access
   and API paths.

8. **AEO and SEO are first-class.** Every user-facing page must be optimized for
   both search engines (SEO) and answer engines / LLM crawlers (AEO): correct
   semantic HTML, unique `<title>` and meta description, Open Graph/Twitter tags,
   canonical URLs, JSON-LD structured data (e.g. `LocalBusiness` for listings),
   accessible headings, fast loads, and an accurate `public/llms-full.txt` /
   `robots`/`sitemap`. Content must be answerable: clear, factual, well-structured
   so an answer engine can cite it correctly.

Default posture: when unsure whether something is "good enough," it isn't — finish
it properly.

## Error-handling reference (required behavior)

Rule 4 in table form. Every row is mandatory, not advisory. When you write code that
can hit any of these conditions, handle it exactly as the "Required handling" column
says. Do not swallow errors; do not leave a path unhandled.

| Condition | Where it happens | Required handling | User-facing result |
|---|---|---|---|
| **Missing env** (`VITE_SUPABASE_URL` / `_ANON_KEY` unset) | app boot, `src/lib/supabase.ts` | Fail loud at startup — throw a clear error; never construct a client with `undefined`. | App refuses to start with an explicit "missing config" message, not a blank screen. |
| **RLS denial / no policy** | Supabase `select` | Returns **empty data, not an error** — treat empty result as a valid "nothing visible" state, never as a bug to retry. Verify the policy if data is unexpectedly empty. | Empty state ("no results"), not an error toast. |
| **`42501` insufficient privilege** | Supabase write from client | Do not retry. This is a governance violation (writes are service-role only) — surface as a developer error, fix the call site. | Generic "couldn't save" + logged dev error. |
| **`401` / expired or missing auth** | any Data API call | Catch, clear stale session, route to sign-in. No infinite retry loop. | Redirect to sign-in, no blank screen. |
| **`429` / rate limited** | Supabase or third-party API | Respect `Retry-After`; exponential backoff with a capped retry count; then fail gracefully. Pre-empt with client-side debounce/throttle on user-driven calls (search, geocode, autocomplete). | Brief "try again" state; no hammering. |
| **Network failure / timeout** | any fetch / RPC | Wrap with a timeout (`AbortController`); retry idempotent reads with backoff; never an unhandled rejection. | Retry affordance + offline-friendly message. |
| **PostgREST `400` (bad query/param)** | malformed filter/RPC args | Validate inputs before the call; treat a 400 as a bug to fix, not retry. | Generic error + logged details. |
| **Geolocation denied/unavailable** | `nearby_businesses` flow | Degrade gracefully to manual location/search; never block the UI waiting. | Prompt for manual location. |
| **Render error in any subtree** | React components | A React **error boundary** must wrap route-level subtrees so one component crash does not blank the whole app; log the error. | Localized fallback UI, rest of app works. |
| **Unexpected/unknown error** | anywhere | Catch at the boundary, log with context, show a generic non-leaky message. Never expose stack traces, SQL, or keys to the client. | Safe generic error message. |

If a new failure mode appears that isn't in this table, add a row — don't handle it
ad hoc and move on.

## Common AI failure modes (read before acting)

You (the AI agent) are statistically likely to make the mistakes in the left column.
They are listed because they have already happened or are high-risk here. Before you
act, check your intended move against this table. The "Why" is the reasoning — internalize
it, don't just memorize the rule.

| Frequent AI error (don't) | Correct way (do) | Why we do it the correct way |
|---|---|---|
| Create a table and assume it's private because "Supabase is deny-by-default." | `enable`+`force` RLS, then `revoke all from anon, authenticated`, then minimal `grant`, then a policy. | Supabase **auto-grants** new `public` tables to `anon`/`authenticated`. Skipping the REVOKE leaves the table exposed with RLS as the only guard — a silent data leak. See `SUPABASE.md`. |
| "Fix" missing data by widening a GRANT or disabling RLS. | Diagnose the **policy**; an empty result usually means RLS is working. Keep grants minimal. | The grant isn't the bug — the policy is. Widening access to make data appear is how `candidate` rows or private data get exposed. Governance forbids it. |
| Push the whole `001_init.sql` through one MCP `apply_migration` call. | Split into chunks (extensions+enums+table+indexes / RLS+grants+policy / the function), or use CLI/`psql`. | The single call **truncates** on the large `$$` function body and silently fails. Chunking is the known-good path. |
| Put a new migration anywhere, or run `supabase db push` and assume it worked. | Use `migrations/` as the source of truth; for CLI, add `supabase/config.toml` + timestamped file under `supabase/migrations/`. Verify with `list_migrations`/`list_tables`. | The tooling only reads `supabase/migrations/`. There's no `config.toml`, so `db push` no-ops — "success" with zero effect. Always verify against the live DB. |
| Assert an API signature, schema column, or library behavior from memory. | Read the actual file / run `list_tables` / search the official docs first. | Training memory drifts and Supabase auto-grant behavior is counterintuitive. Guessing produces confident, wrong code. Verify, then act. |
| Edit a file after reading only the relevant lines. | Read the whole file (and related docs) before editing. | Partial reads miss invariants, existing helpers, and side effects — causing duplicate logic or broken assumptions. Rule 3. |
| Mark the task done with a `TODO`, stub, or "wire up later" remaining. | Finish it end-to-end, or state explicitly and precisely what remains. | "Done" that isn't done costs a second pass — there's time to do it right, not twice (Rules 1–2). Hidden stubs ship as bugs. |
| Make a test pass by mocking the thing under test. | Test real behavior against the real system / local Supabase. | A test that mocks what it claims to verify proves nothing and gives false confidence. Worse than no test (Rule 7). |
| `catch {}` / swallow an error / ignore a rejected promise. | Handle per the Error-handling table: log, surface, retry/boundary as specified. | Silent failures blank the app or corrupt state with no signal. Fail loud, degrade gracefully (Rule 4). |
| Add a new dependency (or a deprecated one) for something the repo already does. | Reuse existing utilities; if a dep is truly needed, pick a current, supported one. | New/deprecated deps add attack surface, bloat, and future rework. Lazy code reuses (Rules 5–6). |
| Duplicate logic or re-fetch/recompute data already available. | Reuse the existing function; memoize/cache; fetch once. | Redundant work is slower and drifts out of sync across copies. The best code doesn't run twice (Rule 5). |
| Put a service-role key or secret in client code, or log keys/SQL/stack traces. | Service role stays server-side; client gets the publishable/anon key only; errors logged without secrets. | Anything in `VITE_*`/client bundles is public. A leaked service key bypasses all RLS. Catastrophic and irreversible. |
| Commit, push, or force-push without being asked. | Make changes in the working tree; commit/push only when the user requests it. | The user controls when work lands. Unrequested pushes (especially force) can overwrite or publish prematurely. |
| Claim "it works" without building/testing. | Run the build and tests; report real output, including failures. | Unverified claims erode trust and hide regressions. Done means **verified** done. |
| Skim this doc and pattern-match a few rules. | Read it fully; when a rule conflicts with a shortcut, the rule wins. | This document exists precisely to stop the failure modes above. Skimming reintroduces them. |

If you catch yourself about to do something in the left column, stop and do the right
column instead. If a new recurring AI error shows up, add a row.
