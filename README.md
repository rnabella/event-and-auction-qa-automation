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
              in-memory store, a JSON API, and static pages for two
              sides: donor-facing (register → donate → checkout →
              confirm) and admin-facing (login, a setup checklist,
              creating tickets, auction lots, and raffles)
src/          the framework: typed API clients (DonorApi, AdminApi),
              Playwright Page Objects for both sides, environment
              config — everything the tests are built on
tests/        the tests themselves, organized by layer and by side:
              donor/, api/ (Phase 1); setup/, admin/ (Phase 2) — Phase 3a
              (buy-now) and Phase 3b-1 (sealed bidding) added more tests to
              donor/ and api/, no new dirs; Phase 3b-2 (raffle entry) added
              tests to donor/, api/, and admin/
```

`demo-app` is deliberately plain, untyped, unreviewed-by-the-framework's
own lint config — it's a test fixture, not the thing under review. Treat it
the way you'd treat a staging environment you don't own: something the
suite drives, not something the suite's own code quality standards apply
to.

`src` and `tests` follow a standard Page Object Model, split into two
independent layers that can each be exercised on their own:

- **UI layer** (`src/pages/`, `tests/donor/`, `tests/admin/`) — Page
  Object classes wrapping both the donor journey's pages and the admin
  pages, driven through a real browser.
- **API layer** (`src/api/DonorApi.ts`, `src/api/AdminApi.ts`,
  `tests/api/`) — typed clients hitting the same backend directly, no
  browser involved. Faster, and useful for asserting on state the UI
  doesn't surface directly (e.g. the running total, or a route's exact
  status code).

Both layers share `src/config/env.ts`, which supports pointing the whole
suite at a different target via `ENV_FILE=.env.other npm test` — useful if
this ever grows a second environment (a staging deploy of the demo app,
for instance) without touching any test code.

## Why the admin tests log in once, not per test

Admin routes (`/api/admin/*`) require a session cookie, issued by
`POST /api/admin/login`. Rather than logging in inside every admin test,
the suite uses Playwright's standard idiom for this: a `setup` project
(`tests/setup/admin-login.setup.ts`) logs in once and saves the resulting
cookie to `playwright/.auth/admin.json` (gitignored — it's session state,
not something to commit); the `admin` project declares `setup` as a
dependency and reuses that saved storageState for every test in
`tests/admin/`. No admin test calls `login()` itself.

One non-obvious thing this surfaced: `--grep @smoke` does **not** filter
out the `setup` project's test, even when it isn't itself tagged. That's
not a guess — it was confirmed two ways: reading Playwright's installed
runner source (dependency-project suites are built from an unfiltered
project list, independent of the CLI `--grep`), and a differential test
(temporarily removing the tag and re-running to confirm the setup step
still executed). The tag on the setup test is kept anyway, for clarity,
but isn't load-bearing — worth knowing before "cleaning it up."

Demo admin credentials (`admin` / `admin123`) are intentionally hardcoded
in `demo-app/data/adminStore.js` — this app has no real users, so there's
nothing to protect. Don't take the pattern (or the credentials) into a
real app.

A different, narrower pattern shows up in `tests/donor/buy-now.spec.ts`:
a donor-side test that merely needs _a_ valid admin session (to create a
fixture lot) logs in inline via the API, once, rather than reusing the
`admin` project's storageState — it isn't testing admin login itself, so
it doesn't need that machinery. `tests/donor/sealed-bid.spec.ts` uses the
identical pattern, for the identical reason.

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
| `npm test`                | Full suite: donor + admin E2E (Chromium) and API tests, 41 tests   |
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
is a fine trade at forty-one tests. A more scalable fix — namespacing state
per test or per worker — is the natural next step if this suite grows
enough for single-worker execution to become a real bottleneck.

The admin store adds a second instance of a related, subtler bug: its
`reset()` deliberately does _not_ clear sessions (the `setup` project logs
in once per run; clearing sessions on every test's reset would log
everyone out after test one), but it originally shared its id counter
between sessions and entities (tickets/lots) — so a second login after a
reset would silently reuse a still-valid session id. Fixed by giving
sessions their own counter, one `reset()` doesn't touch. The negative-auth
tests (`tests/admin/auth.spec.ts`, `login.spec.ts`) exist specifically
because the phase that added authentication had, for a while, zero tests
proving authentication denied anything.

## Status

**Phase 1** ("the spine"): demo app, framework, and the donor journey
(register → donate → checkout → pay → confirm), tested end-to-end and via
the API. Complete.

**Phase 2** ("admin side"): admin login with storageState reuse, a setup
checklist that auto-completes based on real actions, ticket/lot creation,
and negative-auth coverage. Complete.

**Phase 3a** ("buy-now"): a donor can purchase a specific auction lot at
its fixed buy-now price; a second purchase attempt, or a purchase attempt
on a lot with no buy-now price, is rejected with a real error. Complete.

**Phase 3b-1** ("sealed bidding"): donors can place sealed bids on a lot,
and an admin can close bidding to award it to the highest bidder — bids
are stored separately from the lot object (`adminStore`'s `bidsByLot`),
so no route that serializes a lot can ever leak rival bids before
bidding closes. Complete.

**Phase 3b-2** ("raffle entry"): an admin can create a raffle (completing
its own checklist item, same as tickets and lots) and draw a winner from
the entrants; donors can enter a raffle via the donor UI and the API.
Complete.

Raffle entries deliberately live in their own store (`adminStore`'s
`entriesByRaffle`), not on the raffle object itself — the same
lot-object/bids-object separation Phase 3b-1 needed a fix to arrive at is
applied here from the start, so entries can never leak through a route
that serializes a raffle before the draw. Reapplying that lesson pre-emptively
this time, not rediscovering it after something broke.

This phase also settles the rule this codebase has been following for when
a new entity type gets its own admin page: an entity whose creation
completes a checklist item gets one, in the same phase it's added
(tickets, lots, and now raffles). A field on an existing entity
(`buyNowPrice`) or a lifecycle transition on one (closing a lot, drawing a
raffle) does not get one on its own — those are exercised through the API
and existing pages instead.

Planned next: cross-browser hardening (Phase 3).
