# Event & Auction QA Automation

[![CI](https://github.com/rnabella/event-and-auction-qa-automation/actions/workflows/ci.yml/badge.svg)](https://github.com/rnabella/event-and-auction-qa-automation/actions/workflows/ci.yml)

Playwright + TypeScript test automation for a fictional "Event & Auction
Platform" — a small donation/ticketing/auction site. Unlike most portfolio
test suites, this one doesn't point at someone else's staging environment:
the system under test (`demo-app/`) is built into this repo, so cloning it
and running `npm test` gets you a fully working, self-contained suite with
no external dependencies, credentials, or shared test data to coordinate
around.

## Quick start

```bash
npm ci
npx playwright install chromium
npm test
```

That's it — `npm test` boots the demo app itself (via Playwright's
`webServer`), runs the suite against it, and tears it down. No `.env` file
is required to run locally; `playwright.config.ts` and `demo-app/server.js`
both default to `http://localhost:3000`.

## Architecture

```
demo-app/     the system under test — a small Express app with an
              in-memory store, a JSON API, and static donor-facing pages
              (register → donate → checkout → confirm)
src/          the framework: typed API client, Playwright Page Objects,
              environment config — everything the tests are built on
tests/        the tests themselves, organized by layer (donor UI, api)
```

`demo-app` is deliberately plain, untyped, unreviewed-by-the-framework's
own lint config — it's a test fixture, not the thing under review. Treat it
the way you'd treat a staging environment you don't own: something the
suite drives, not something the suite's own code quality standards apply
to.

`src` and `tests` follow a standard Page Object Model, split into two
independent layers that can each be exercised on their own:

- **UI layer** (`src/pages/`, `tests/*/` non-`api` specs) — Page Object
  classes wrapping the donor journey's pages, driven through a real browser.
- **API layer** (`src/api/DonorApi.ts`, `tests/api/`) — a typed client
  hitting the same backend directly, no browser involved. Faster, and
  useful for asserting on state the UI doesn't surface directly (e.g. the
  running total).

Both layers share `src/config/env.ts`, which supports pointing the whole
suite at a different target via `ENV_FILE=.env.other npm test` — useful if
this ever grows a second environment (a staging deploy of the demo app,
for instance) without touching any test code.

## A design decision worth explaining: the lagging total

`demo-app`'s `/api/totals` endpoint doesn't update the instant a donation
is paid — it lags by ~300ms, simulating a reconciliation pass that runs
slightly behind the write path (a common pattern in real systems: a
read-replica, a materialized view, an async rollup job). This is
deliberate, not a bug in the demo app.

It exists because a test suite that never has to wait for anything doesn't
demonstrate much. `tests/donor/donation-journey.spec.ts` asserts the total
updates using Playwright's `toPass()` retry wrapper rather than a single
immediate assertion — the honest way to test against a system with
eventual consistency, instead of papering over it with an arbitrary sleep.

The commit history has a real example of getting this kind of thing wrong
before getting it right: an early attempt at fixing a test-isolation race
condition (`f46a426`) was incomplete and introduced a new silent-failure
mode, caught in review, and replaced with a simpler, more complete fix
(`d0eb0e4`) that serializes the suite (`workers: 1` in
`playwright.config.ts`) rather than trying to patch around shared mutable
state test-by-test. Left in the history on purpose — it's a more honest
record of the process than a suite that looks like it worked on the first
try.

## Scripts

| Command                   | What it does                                                       |
| ------------------------- | ------------------------------------------------------------------ |
| `npm test`                | Full suite: donor E2E (Chromium) + API tests                       |
| `npm run test:smoke`      | Just the `@smoke`-tagged subset — the critical path, fast          |
| `npm run test:regression` | Alias for the full suite (same as `npm test`)                      |
| `npm run demo-app`        | Runs the demo app standalone on `:3000`, for poking at it manually |
| `npm run typecheck`       | `tsc --noEmit` over `src/`, `tests/`, and the Playwright config    |
| `npm run lint`            | ESLint over the TypeScript framework (not `demo-app/`)             |
| `npm run format`          | Prettier check                                                     |
| `npm run format:write`    | Prettier, applied                                                  |

CI (`.github/workflows/ci.yml`) runs typecheck → lint → format → test on
every push and pull request, and uploads the Playwright HTML report as a
build artifact if the test step fails.

## Why the suite runs single-worker

`demo-app` holds one shared in-memory store for its whole process, and
tests reset it between runs via `POST /api/test/reset`. Two tests running
concurrently against that one store can interleave their resets and
writes — which is exactly the bug described above. Serializing
(`workers: 1`) closes that off simply, at the cost of parallelism, which
is a fine trade at three tests. A more scalable fix — namespacing state per
test or per worker — is the natural next step if this suite grows enough
for single-worker execution to become a real bottleneck.

## Status

**Phase 1** ("the spine"): demo app, framework, and the donor journey
(register → donate → checkout → pay → confirm), tested end-to-end and via
the API. Complete.

Planned next: an admin-side login/checklist/ticketing flow (Phase 2), then
additional donor scenarios — buy-now, sealed bidding, raffle entry — plus
cross-browser hardening (Phase 3).
