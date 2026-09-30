# Status

The living ledger. Update it at the end of every session, in the same PR as the work.
Newest entry first. Dates and times are UTC. A reader should be able to start from here alone.

## Last updated: 2026-09-30 03:45 UTC (Claude Code cloud session "App error review", branch `claude/app-error-review-o46y68`; NOTHING from this session is on `main` yet — every line below is a branch waiting for the owner)

### Two outages found on 2026-09-30: one fixed in this PR, one needs the owner

**1. The free property check has been failing for every visitor since about 2026-09-29.**
The Florida DOR statewide parcel layer both check pages read
(`Florida_Statewide_Cadastral`) now answers every request, even its own metadata, with
HTTP 200 `{"error":{"code":499,"message":"Token Required"}}`. The pages read that 200 as
"no parcel under it", so every visitor was told their house has no parcel record and the
analytics counted a failed check. **Fixed in this PR:** the pages now query the same
organization's public parcel *centroid* layer (identical fields, updated 2026-09-29),
take the centroid nearest the geocoded rooftop, prefer the one whose site address
carries the typed house number, skip common areas, and say how the parcel was matched.
Verified against the live layers on four addresses (Viera, Melbourne, Bradenton, Cocoa
Beach) in headless Chromium. The app's own research used the same dead layer
(`src/domain/propertyLinks.ts`); the app-side switch is on the app branch listed below.

**2. The accounts host's bot-protection is answering API calls with a challenge page.**
`accounts.eb28.co` (shared cPanel host) runs behind Imunify360. Measured live from this
sandbox on 2026-09-30, with ordinary user agents (Node's default and iPhone Safari):
`GET /auth/me`, `GET /properties`, `GET /billing/entitlements` and `POST /client-errors`
came back as an HTTP **200** `text/html` "Please wait while your request is being
verified..." page, or a **403** JSON "Access denied by Imunify360 bot-protection", instead
of the API's reply. A server-to-server fetch can never solve that challenge.
What it did to the product (read from the code, then reproduced by booting the records
API against a fake accounts host that serves the page):
- Records API `introspectToken` read the 200 page as "not active", **cached it as a
  definitive deny**, and answered the app `401 "Your session has expired ... Sign in
  again"`; the app obeys a 401 from the records API by **signing the inspector out
  mid-job**. `/health` showed `accounts.result: http_200`, so nobody could see it.
- The same page on `POST /entitlements/pull` counted as a **paid allow** and was
  remembered for 30 minutes (metering failed open).
- The website's lead form showed "Request received" for a lead that was never recorded.
**Fixed in code** (records API branch `claude/accounts-challenge-guard`, and this PR's
lead form): only a JSON body from accounts is a verdict; a challenge page is "could not
ask accounts" (retryable, never cached, never a grant), and `/health` now reports
`accounts.result: "challenge_page"` when it happens.
**Owner action (the root cause is on the host, not in code):** in cPanel → Imunify360,
whitelist the records service's outbound IPs (Render dashboard → hip-records-api →
"Outbound IP addresses"), or ask Namecheap support to turn off the anti-bot challenge
for the `accounts.eb28.co` subdomain, which serves an API and never a browser page.
Whether Beth's phone is ever challenged cannot be proven from here; the records-API
path (cloud IP) is the certain one.

### Branches pushed this session (none merged; the owner merges)

| Repository | Branch | What it carries | Verified how |
|---|---|---|---|
| this repo | `claude/app-error-review-o46y68` (on `main` `1f4f14a`) | parcel-centroid repair of the free check on `index.html` and `check.html`; ArcGIS error envelopes and FEMA timeouts worded honestly; lead form counts only a JSON `{ok:true}`; auto-pull county list matches the records API (15 counties, 50 city portals — Lake, Nassau, Franklin, Madison were never auto-pulled; Osceola, St. Lucie, Clay, Seminole are); 4-digit DOR use codes; 16px email inputs (check, lp08); wind-mitigation cards styled; how-it-works top bar collapses on phones; `docs/patches/2026-09-30/` holds two unapplied patches (below) | `npm test` 20/20; `npm run mobilecheck` 0 of 46 overflow; live relay run of both check pages on four addresses |
| `hip-records-api` | `claude/accounts-challenge-guard` `9c1d276` | `lib/accounts-response.mjs` + guard in `introspectToken` / `checkPullEntitlement`; a 200 with no allowance left is no longer "paying"; an unconfirmed allowance is 503 retryable, not a 402 paywall; `/health` deploy marker `2026-09-30-accounts-challenge-guard`; RUNBOOK section on the challenge page | `node --check` all, docker-imports, `scripts/test-accounts-response.mjs` (38 cases), test-entitlement, test-session-auth, test-address; booted before/after against a fake accounts host |
| `hip-records-api` | `claude/permit-matching-fixes` `c6f1aac` (merges cleanly with the branch above; checked) | `parsePermitAddress` no longer searches "Ridgewood Ave" for "8600 Ridgewood Ave #101" (a cacheable zero); a row printed "345 WICKHAM RD, WEST MELBOURNE" is no longer rejected as a wrong quadrant; Viera / Merritt Island / Census-resolved unincorporated points no longer get the false "city permits NOT included" warning; a truncated portal read is now said in the note; no-op Accela teardowns no longer fill the 5-slot browser queue (busy 503) | `node --check` all, docker-imports, test-address 170/0, test-brevard-coverage 218/0, test-central-fl-coverage 334/0, test-browser-close 74/0, test-entitlement, test-session-auth. **`node scripts/verify-coverage.mjs` was NOT run (no browsers or portal access here) — run it from the Mac before merging, per that repo's CLAUDE.md.** `test-permit-store` has one pre-existing date-dependent failure on `main` |
| `hip-accounts-api` | `claude/billing-hardening` `dcd0961` | a Stripe event for an OLD subscription (dunning on a failed card, then its "deleted" weeks later) can no longer cancel an account whose NEW subscription is live, nor swap the live subscription id for the dead one (which made "delete account" cancel the wrong one); reconcile-from-Stripe no longer reports "active" when its write was rejected (the loop that minted full tokens for inactive rows and sent people back to checkout as "already active"); two simultaneous registrations with the same username no longer crash the whole accounts server (409 instead; every async route now answers a JSON 500 instead of exiting the process); a lapsed subscriber with an unspent $5 credit can use it; an active subscriber can buy an overflow pull or change plan (portal) instead of being told "already active"; a plan change made in the billing portal now updates the plan and limits; storage caps raised (2 GB, admins exempt) with a JSON 413 instead of an HTML error page; the bundled demo house is never metered (it used up a free account's one included address) | `node --check` all; `node --test` 86/86 (was 69); each defect reproduced on current `main` before the fix and re-run after |
| `home-inspection-assistant` | **`claude/app-fixes-2026-09-30` `b432f98` — the one to merge; it contains the five topic branches below plus the cross-branch fixes** | everything in the five rows below, plus: the 4-Point "Age of system" cell falls through to an approved condenser / air-handler plate read; saving the setup wizard merges only the fields the inspector changed onto the CURRENT profile and the wizard closes when the server restores a filled-in profile (a wizard seeded on a blank local book appended a second sparse profile and dropped the restored signature/license/logo); sign-out pushes pending offline writes and asks before discarding anything the server has not confirmed; a lapsed plan on boot says so instead of reading as an outage; the "opening…" drawer keeps tap-to-cancel but drops the 15 s timer (over budget by 145 B with everything merged) | `tsc -b` clean; vite build; budget 132,491 B gzip (under by 0.6 KB); vitest 652/652; `npm run score` 100/100; mobile check 13 surfaces fit 375 px |
| `home-inspection-assistant` | `claude/official-forms-honesty` `0b27437` (topic branch, inside the one above) | any electrical permit no longer stamps panel age / year updated / main amperage (only service-scope permits, amps ≥ 60); the 4-Point "Age of system" prints exactly the workspace value (no hidden PDF-only year from a permit); TPRV boxes follow the leading word of the answer ("Yes - drain line not extended" is a Yes); the unit/apt number reaches every address line, footer and photo-page header; editing a selected permit's date/number/scope re-imports it; a dead/expired roof permit says why it cannot be selected (on the card, not a tooltip); readiness no longer demands an approved finding on a clean job; the inspector logo survives reload. Five of the fifteen verified form defects (wind-mit §4.2 "A" credit, electrical Satisfactory auto-check, §4.1 No-Info on the shingle row, owner email, Q1 date format) had already been fixed upstream on 2026-09-10 | `tsc -b` clean; vitest 543/543 (58 new); prod build; budget under; `npm run score` 100/100 |
| `home-inspection-assistant` | `claude/research-client-fixes` `77b9c1e` (topic branch) | the app's research reads the DOR roll from the public centroid layer (street-number match, else nearest building centroid, basis recorded in the source note; proximity picks marked "medium"); a truncated permit read renders as PARTIAL HISTORY; pasted permit rows parse the permit number instead of "MAIN"/"BUILDING"/the year; BCPAO "no property matched" reads as not found instead of "Records API unavailable"; a hand-typed address is accepted only when the geocoder matched THIS house (street number and directional agree), so a road point or ZIP centroid no longer pulls a neighbour's owner into the insured name; the DOR effective-year roof proxy queues for review instead of auto-filling the roof year on the signed forms | `tsc -b` clean; vitest 514/514 (was 485); prod build + budget; live smoke on a real Viera address (one request, street-number match) |
| `home-inspection-assistant` | `claude/photo-pipeline-fixes` `4a90223` (topic branch) | plate OCR can no longer hang the Scan button forever (SIMD probed up front; engine start bounded at 20 s, recognition at 60 s); the image editor fits a 375 px phone (was a fixed 520 px stage with the crop handles off-screen) and its crop handles are 24 px on touch; the offline template scan no longer fabricates "Unsatisfactory - safety review required" for an electrical photo (that value reached the signed 4-Point once approved); labeled non-plate photos skip the 10-30 s OCR pass; sub-panel photos no longer write into the MAIN panel age/brand; the signature pad re-sizes after rotation instead of drawing at 2x offset; "MODEL NUMBER X" parses the model; the tour stops re-navigating on every re-render; a Wind-Mit run stops after the first unreachable step (feature is shelved anyway); the admin crash-report list shows an error with Retry. The mobile-overflow guardrail gained an image-editor surface and a scroll-container probe, refuses to grade a stale dev server, and kills the server it starts (an orphan from 2026-09-01 had been silently graded by earlier runs) | `tsc -b` clean; vitest 522/522 (was 485); build; budget; mobile check 13 surfaces ok at 375 px |
| `home-inspection-assistant` | `claude/session-sync-fixes` `6fa0986` (topic branch) | a photo-heavy record no longer aborts at 12 s and gets replaced by a phantom blank (90 s cap; when listed records cannot be fetched the boot screen says "try again" instead of inventing one); boot list calls carry a timeout; a lapsed plan shows a plain sentence instead of raw "subscription_required" and keeps the record dirty; a property created offline appears in the switcher; a 409 that is not a version conflict (the per-account cap) no longer drops the dirty flag | `tsc -b` clean; vitest 494/494 (8 new); build + budget |
| `home-inspection-assistant` | `claude/data-loss-fixes` `dfc3b7f` (topic branch) | research is pinned to the house it started for (correcting address A to B mid-pull no longer writes A's owner, parcel and year built onto B); deleting a property waits for its in-flight autosave (a DELETE that overtook a save was undone when the save landed); sign-out asks before discarding a save the server refused; calendar re-sync fills the address on first import only instead of overwriting a corrected street; "Load demo data" no longer autosaves the sample house to the server (which burned the free address); opening a Drive report keeps the active slot's id (the next autosave wrote under a foreign id); the address menu no longer opens by itself when a property opens (a stray tap re-selected an address and wiped owner, parcel and permits); "Finalized"/"Signed" tapped twice no longer re-date the signatures; photos file under the local day; an `.ics` time with a trailing Z is read as local (a 9 AM Eastern booking imported as 1 PM); a pasted "Date: Wednesday, July 15, 2026" is normalized instead of written verbatim; an expired token lands on the login screen with a notice saying why | regression tests in `dataLossRegressions.test.tsx`, `bookingDateParsing.test.ts`, `calendarSync.test.ts`; budget 129.1 KB gzip (calendar upsert and booking-text parsers moved behind existing lazy imports to pay for it) |

### How the review was done, and what was NOT changed

Eighteen scoped reviewers read the site, the app source and both APIs (September 1
state). Their 174 candidate findings (16 official forms, 48 session and data loss,
77 billing and entitlement, 13 photos and OCR, 11 records API, 9 marketing site) went to
six verifiers, each of which had to reproduce a finding before it counted (a test against
the real module, the real PDF templates, a real local accounts server, or a
headless-Chromium run). Only reproduced findings were fixed, and every fix was re-checked
against `main` as of 2026-09-23 first: five form defects had been fixed upstream on
2026-09-10; the records API's abort safety (`9db92d1`) and partial-permit-failure handling
(`4bb4427`) and the app's local-clock date default (`794186c`) were already on `main` and
got regression tests only.

Two fixes are written but **deliberately not applied**, in `docs/patches/2026-09-30/`
with a README saying why and how: the Accela pagination race in the records API (needs the
live `verify-coverage` run from the Mac), and `PUT /properties` versioning in the accounts
API (the app must change first, or every conflict makes a device discard its own edits).

### Still unverified

- Anything on the owner's Mac, Render's dashboard (outbound IPs), or cPanel.
- Whether Imunify360 challenges Beth's phone; only the cloud-IP path was measured.
- A real end-to-end permit pull through the challenge guard in production (needs a
  signed-in account; the local before/after boot is the evidence).
- A real end-to-end checkout at $50 and $500 (still open from 2026-09-23).

### What the owner needs to do next, in order

1. Merge this PR (site). The free check comes back with the next Pages run.
2. Merge `hip-records-api` `claude/accounts-challenge-guard` (Render auto-deploys; the
   `/health` marker flips to `2026-09-30-accounts-challenge-guard`).
3. cPanel → Imunify360: whitelist Render's outbound IPs, or have Namecheap disable the
   anti-bot challenge on `accounts.eb28.co`. Without this, step 2 only turns a silent
   sign-out into an honest "try again".
4. Merge `hip-accounts-api` `claude/billing-hardening` and deploy it to the host the way
   the 2026-09-23 offer went out (host code == GitHub `main`, restart, health ok). Then, in
   Stripe, set up the customer portal to offer the $50 and $500 plans (`STRIPE-SETUP.md`),
   or the in-app "change plan" link opens a portal that cannot switch.
5. From the Mac, in `hip-records-api` on `claude/permit-matching-fixes`, run
   `node scripts/verify-coverage.mjs`; if it is clean, merge it.
6. Merge `home-inspection-assistant` `claude/app-fixes-2026-09-30` (the five topic branches
   can be closed unmerged; they are its parts), then run `./deploy-hip.sh` from the Mac.
7. Still open from 2026-09-24: the Render persistent disk for the permit store.

### Previous update: 2026-09-24 23:35 UTC (Claude Code session on the owner's Mac; everything from here down is on `main`)


### Instant permit lookups (2026-09-24 UTC)

- **Records API #8, live 23:31:** every good permit result is kept per address. Repeat lookups answer in about 0.03 s instead of 10–45 s, and addresses are re-checked nightly (02:00–05:00 ET). A glitch can never shrink or empty a good list; lists older than 7 days are pulled live first. Old vs new on Viera, Melbourne, Cocoa and Rockledge gave identical permit numbers. Store health: `https://hip-records-api.onrender.com/health/store` (counts only).
- **App #13:** 'Refresh records' sends `fresh=1`, so it always pulls live.
- **Owner/engineer step still open:** add a Render persistent disk (1 GB, mount `/var/data`) and set `PERMIT_STORE_DIR=/var/data` and `CACHE_DIR=/var/data/cache` on `hip-records-api`. Until then the saved copy is emptied on every deploy (lookups still work; they are just slow again the first time).

### Permit coverage and Beth's audit (2026-09-23/24 UTC)

| What | Live | Verified |
|---|---|---|
| Beth audit: every request she made that reached `main` is live; five never-merged August fixes ported (free-address wall first, blank permit cards as search tasks, empty cards can't be selected, 'why empty' note); warning when one permit portal fails | app #11 | 468 tests, score 100, mobile check at 375 px |
| BS&A (Satellite Beach, West Melbourne, Melbourne Beach, Titusville, Cape Canaveral) was refusing every lookup (HTTP 403): now reuses the search session and sends the property token | records #3, #4 (18:37) | Old code 403 confirmed; new flow not yet seen end to end from production (this Mac is behind BS&A's human check) |
| Lifetime history, Brevard: Indialantic, Grant-Valkaria, county Legacy Permit Search 1990–2007, Cocoa archive 2008–2021, older-records contacts per town | records #5 (20:33), app #12 'Older permits' | Old vs new: Viera 100→122, Cocoa 0→12, Grant-Valkaria 2→7, others identical |
| Central Florida: Osceola County, Seminole County, Oviedo, Lake Mary, Sanford & St. Cloud archives, Orlando, Winter Park, Winter Garden, Maitland, Ocoee, Altamonte Springs, Longwood, Port Orange, Orange City, Holly Hill, Palm Coast, Vero Beach; strict address matching for Click2Gov/Clear Village | records #6 (21:57) | Two independent reviews, all findings fixed; old vs new identical for Brevard |

**Link only (human-check or login gated):** Orange County, Volusia County, Port St. Lucie, Daytona Beach, Cocoa Beach, Malabar, and the current portals of Cocoa, Sanford, St. Cloud, Casselberry. **No online records:** Indian Harbour Beach, Palm Shores.
**Open:** Palm Bay's public data stops mid-2022; app wording for `coverageScope: city-unconfirmed`; the amps option "<250A" (Beth dictated it; confirm whether she meant ">250A"); app bundle has ~0.45 KB headroom.

### Launched 2026-09-23 (UTC): new pricing live, Wind-Mit AI shelved, backups restored

| When | What | Verified |
|---|---|---|
| 15:53 | Hourly backup restored: `co.eb28.hipbackup-standin` on the owner's current Mac (backup only, 30 days, `~/hip-backups`) | First run integrity ok; the older Mac's job had not run since 2026-09-03 |
| ~16:30 | Wind-Mit AI photo analysis shelved (app #10, `WINDMIT_AI_ENABLED=false`; nothing deleted) and its step taken off How it works (#21) | 427 tests, score 100; live app shows no AI claim; records/permit autofill code untouched |
| 17:2x | Stripe: new products/prices $50/month `price_1UIsldJ77pBbyOYYwUcJ2rn5` and $500/year `price_1UIsljJ77pBbyOYY2Aqz3sBJ`; host settings `STRIPE_PRICE_UNLIMITED_MONTHLY_50` and `STRIPE_PRICE_ANNUAL_500` added | All seven price settings on the host match Stripe |
| 17:26 | Owner: the only subscriber (a $20/month customer) set to cancel at period end (2026-10-17) | Stripe `cancel_at_period_end=true`; account still active until then |
| 17:27 | Accounts API offer v2 live (hip-accounts-api #2) | Host code == GitHub main; restart 17:27; health ok; rollback copy `~/hip-accounts-api-src-before-pricing-20260923.tgz` on the host |
| 17:29 | Records API paywall wording live (hip-records-api #2) | `/health` deploy `2026-09-21-paywall-wording` |
| ~17:35 | App with the new prices deployed (app #9) | 442 tests, score 100, 8 deploy markers; live bundle sends `offer: v2` and keeps the wrong-price guard |
| ~17:40 | Website with the new prices (#22), terms effective September 23, 2026 | Launch check ok; 46 live page-widths clean; no old price on any page |

**Still unverified:** a real end-to-end checkout at $50 and $500 (needs a signed-in free account; the owner can open the app, choose a plan, confirm Stripe shows the amount, and close without paying). The GA4 view of `begin_checkout` values 50/500.

### Done today (2026-09-21): all five pull requests are merged and the website fix is live

The owner asked for a check that no pull request erases an earlier fix and that nothing
breaks, then delegated the decision in writing. What was done, in order (times UTC):

| When | What | Proof |
|---|---|---|
| 16:27 | The exact result of merging app #5 + #6 + #7 was pushed as a temporary branch and the app's full CI run on it **before** anything touched `main` | [run 35625737494](https://github.com/richducat/home-inspection-assistant/actions/runs/35625737494): 56 test files, production build with `/app/` base, bundle budget, typecheck, all green. Temporary branch deleted afterwards |
| 16:29 to 16:30 | App [#5](https://github.com/richducat/home-inspection-assistant/pull/5), [#6](https://github.com/richducat/home-inspection-assistant/pull/6), [#7](https://github.com/richducat/home-inspection-assistant/pull/7) merged; [#2](https://github.com/richducat/home-inspection-assistant/pull/2) closed as a pure duplicate of #5 | App `main` is `0a1c173`; its tree hash equals the tree CI had validated; CI on `main` green too |
| 16:30 | Site [#16](https://github.com/richducat/inspection-rent/pull/16) merged (`c4860e0`); [#3](https://github.com/richducat/inspection-rent/pull/3) closed, its commit is inside #16 | Pages run 53 green |
| 16:33 | Live check | All 23 analytics pages HTTP 200 with exactly one guard and one tracker tag; `/app/` 200 with the guard and its bundle 200; both API health checks `ok`; **46 of 46 live page-widths (23 pages at 320 and 375 px) have no sideways scroll**, measured in a real browser with stylesheets loaded, which also covers `lp01` to `lp05` that the repo's check could not measure |
| 16:51 | App [#8](https://github.com/richducat/home-inspection-assistant/pull/8) merged: one line in `deploy-hip.sh`. Its feature checklist still looked for the words "inspection filing cabinet", but the 2026-09-10 update had reworded that heading to "Find a previous inspection", so the script aborted a healthy build (before committing anything). The live 2026-09-10 build did not contain the old words either | The other seven markers matched the live build file for file |
| 16:53 | **App deployed** from app `main` `0a12b04` as site commit `599aea5`, with the repo's own `deploy-hip.sh` and all 8 feature checks passing. Before it: `npm test` 427 of 427, `npm run score` 100 / 100, on Node 22.23.2 | Pages run 55 green; live `/app/` 200 with the guard; new bundle `index-CT4qL3J5.js` and every referenced asset 200; the app boots at 375 px in a real browser with no console errors and no sideways scroll |

Why it was safe, in one paragraph: every PR branch sat directly on top of its `main` (0
commits behind), so nothing on `main` could be lost by merging; across all 38 files #16
removed only four distinct lines from `main` (the old loader line, the charset tag that
moved up, one `<div>` that gained a class, the pricing grid's inline style that moved into
the stylesheet); no file was deleted in either repository; the only change under `app/` is
the one guard line; and the app merges cannot reach inspectors until `deploy-hip.sh` runs.
No branch was deleted.

### Read this first: the Mac you use now is not "the owner's Mac" in these documents (found 2026-09-21)

This session ran on your Mac instead of in the cloud, so for the first time somebody looked.
The user account on this Mac was created on 2026-09-11. It has the website folder and a
copy of the app's source, but none of the machinery the documents say runs "on the owner's
Mac". The table is in `SYSTEM-MAP.md` under "Which Mac?". What it means for you:

| What | State on 2026-09-21 | Verified or believed |
|---|---|---|
| SSH key `~/.ssh/hip_deploy_ed25519` | Not on this Mac; the hosting server refused the login | Verified |
| A key named `hip_claude_ed25519` | Seen in cPanel at 17:25 UTC: **no key of that name existed.** `hip_deploy_ed25519` is there and authorized (so the older Mac can get in and cPanel needed no change for it), along with two other authorized deploy keys whose holders the owner should identify (issue #14); no private keys are stored on the server. A new pair named `hip_claude_ed25519` was then created on the current Mac (private half stays in `~/.ssh`), and its public half was put into cPanel's Import form for the owner to press Import and then Authorize | Verified. The owner imported and authorized it; **SSH from the current Mac works since 18:10 UTC** (`whoami` answered) |
| Hourly backup of the accounts database, outage and signup alerts, keep-warm | Not set up on this Mac, and **not running on the older Mac either since 2026-09-03** (see question 1 below). Manual backup taken 2026-09-21 18:35 UTC | Verified from the server |
| Wind-mit AI photo analysis | Its address no longer exists on the internet (`NXDOMAIN` from three DNS resolvers) | Verified it cannot be reached; believed failing for every inspector |
| `deploy-hip.sh` (step 4 below) | Could not run in the morning. By 16:53 UTC it had: Homebrew, `gh`, a GitHub sign-in, Node 22 (`brew install node@22`, keg-only, so prefix `PATH` with `/opt/homebrew/opt/node@22/bin`), and a fresh app clone outside iCloud at `~/GITHUB/home-inspection-assistant` | Verified by deploying |
| Sign-in, sync, billing (accounts) and property research (records) | Both health checks answered `ok` at about 2026-09-21 15:45 UTC | Verified |
| The live website | Up (HTTP 200), with the analytics guard and the phone fix since 16:31 UTC | Verified |

**Two questions only you can answer** (reply on [issue #10](https://github.com/richducat/inspection-rent/issues/10)):

1. ~~Is the older Mac still switched on?~~ Answered 2026-09-21: yes. **But its hourly backup
   has not run since 2026-09-03** (verified from the server at 18:11 UTC: every run creates
   and removes a snapshot in the host's `backups` folder, and that folder was last changed
   on 2026-09-03 17:45 UTC; three leftover `auto-*.db` files there are debris from failed
   runs). For 18 days the accounts database had no copy off the hosting disk. **A manual
   backup was taken at 18:35 UTC** with the script's own method (`sqlite3 .backup` on the
   host, copied over SSH, `PRAGMA integrity_check` = ok, newest record 14:24 UTC the same
   day) into `~/hip-backups` on the owner's current Mac. Until the hourly job is repaired
   there is no automatic backup and no outage or signup alert: take a manual one before any
   change to the accounts host, and at least weekly (`RUNBOOK.md` section 12 has the key;
   `hip-accounts-api/deploy/backup-and-watch.sh` is the job). The wind-mit service on the
   same Mac is also unreachable (step 6), so something on that Mac changed around then.
2. Where did the cPanel key named `hip_claude_ed25519` come from? A key in that list lets
   whoever holds its private half into the server once authorized. If you do not know who
   holds it, delete it instead of authorizing it. The safe way to give this Mac access is
   in `RUNBOOK.md` section 12 (make a new key on this Mac, import only its public half).

### This week, in order (owner)

Steps 1 to 4 are done. What is left is yours: 5 (now a decision list, see issue #12), 6 and 7.

1. ~~Merge the app fix~~, 2. ~~merge the two small ones~~, 3. ~~merge this repository's
   pull request~~: **done 2026-09-21**, see the table above. Nothing for you to click.
4. ~~Rebuild the app~~: **done 2026-09-21 16:53 UTC** from your current Mac (see the table
   above). How to do it again is in `RUNBOOK.md` section 6, including the two traps found
   today: the old source folder is inside iCloud, and the script's checklist can go stale.
5. ~~Answer the pricing question~~: **decided 2026-09-21** (a new offer, relayed from Beth;
   the details stay out of this public repository until launch day). Everything is built and
   waiting; see "In flight". What is left for you before launch: get wind-mit back (step 6),
   then one sitting with an engineer or a Claude session: create two prices in Stripe, add two
   settings in cPanel, press merge. The checklist is in the accounts repo's `STRIPE-SETUP.md`
   on the pull request below.
6. **Wind-mit service:** no need to test from your phone any more. On 2026-09-21 its
   address did not exist on the internet at all, so it is down for everyone. What is left
   for you on [issue #8](https://github.com/richducat/inspection-rent/issues/8): say whether
   the older Mac that ran it still exists, and whether you want the feature back.
7. **Two analytics checks** in your Google account, click by click in [issue #7](https://github.com/richducat/inspection-rent/issues/7).

**What your inspector sees today:** sign-in, saved inspections, forms, billing and permit
pulls answered their health checks on 2026-09-21 and are believed working; the wind-mit
AI photo analysis is believed down for everyone (step 6), so she answers those questions
from the photos herself; the marketing pages no longer scroll sideways on phones (fixed live
2026-09-21 16:31 UTC).

### Production right now (as of 2026-09-21 16:35 UTC)

- Site `main` at `c4860e0` is live (Pages run 53, green). All 24 GTM loaders carry the
  hostname guard live, so localhost and preview visits no longer reach GA4.
- The phone layout fix is live: 0 of 46 live page-widths overflow at 320 and 375 px.
- The app at `/app` is the build of app `main` `0a12b04`, deployed 2026-09-21 16:53 UTC
  (site commit `599aea5`, Pages run 55). Source and published copy match again.
- The accounts API runs on the shared cPanel host, not Render. The records API is on Render.
  Both answered `ok` at 16:33 UTC.
- The wind-mitigation service: on 2026-09-21 its hostname returned `NXDOMAIN` from the
  owner's own network and from 1.1.1.1 and 8.8.8.8, so it is unreachable for everyone
  (issue #8).
- A stale copy of the app (built before 2026-08-06) is still live at `eb28.co/HIP/app/`
  against production backends (issue #13).
- The Codex review bot has been out of quota since 2026-09-19 ("usage limits reached");
  none of today's five pull requests got its review. Add credits or expect the same on the
  next PR.

### Open pull requests

None in the app repository. Here: only the small pull request that carries this status
update, if it is not merged yet. Next action that changes production: run
`./deploy-hip.sh` from a Mac with `node` (step 4).

### Open items (GitHub issues are the source of truth; this list mirrors them)

| Issue | What | Who can do it |
|---|---|---|
| [#12](https://github.com/richducat/inspection-rent/issues/12) | **Pricing contradiction:** website sells $98/yr unlimited; the backend's 2026-07-22 decision says $98/mo unlimited, $980/yr annual, $98/yr retired | Owner decides; then site, app and Stripe prices are aligned |
| [#7](https://github.com/richducat/inspection-rent/issues/7) | Confirm in GA4 Realtime that `app_open_click` arrives from an ordinary same-tab click, and that the GA4 internal-traffic filter is Active | Owner (Google account) |
| [#8](https://github.com/richducat/inspection-rent/issues/8) | Confirm the wind-mitigation service on the Mac is reachable and document how to restart it | Owner (Mac) |
| [#13](https://github.com/richducat/inspection-rent/issues/13) | Take down the stale app copy at `eb28.co/HIP/app/` and drop `eb28.co` from both APIs' CORS lists | Owner (eb28.co repo) plus a small API change |
| [#14](https://github.com/richducat/inspection-rent/issues/14) | Write down where every credential lives and add a second person to GitHub, Stripe, Render and Namecheap | Owner |
| [#9](https://github.com/richducat/inspection-rent/issues/9) | Finish or formally shelve the accounts API move to Render | Owner decides; engineer runs the cutover runbook |
| [#10](https://github.com/richducat/inspection-rent/issues/10) | Nothing critical only on the Mac: guides into git, document `hip-vision-api`, dry-run a non-Mac app deploy, write the "Mac is dead" runbook | Owner supplies files; engineer does the rest |
| [#15](https://github.com/richducat/inspection-rent/issues/15) | Stale docs in the three sibling repos (deploy stories, prices, env examples), the "York Inspections" text in the app shell's meta description, the fate of the unmerged app branch `claude/app-issues-beth-aicohr` | Engineer or AI |
| [#11](https://github.com/richducat/inspection-rent/issues/11) | `AGENTS.md` in the sibling repositories (the app repo's is PR #6; the two APIs remain) | Engineer or AI |

### Verified this session (2026-09-21, on the owner's Mac)

- Everything in the "Read this first" table above, with the commands in `SYSTEM-MAP.md`
  "Which Mac?". The SSH test created `~/.ssh/known_hosts` on the Mac (one line, the
  server's public host key); nothing else on the Mac was changed.
- PR #16 has had **no Codex review**: the bot's only comment is "usage limits reached"
  (2026-09-19 18:38 UTC). GitHub reports it mergeable and clean. In its place, four
  independent reviewers read the whole diff (analytics `<head>`, layout CSS, deploy safety
  and the check script, documentation accuracy) and a separate skeptic tried to refute each
  finding. Result: **nothing that changes how the live site behaves or what it sends to
  analytics.** All 24 loaders carry the identical guard; it was executed against eight
  hostnames and loads on the two production hosts only; every inline snippet initialises
  `dataLayer`; the only change under `app/` is the one guard line; no credential is in the
  diff. Static reading only: `npm test` and `npm run mobilecheck` could **not** be run,
  because this Mac has no `node` (the 2026-09-19 results below stand, with the caveat in
  the next list).
- Fixed in this PR from that review: three wrong statements in `ANALYTICS.md` (every
  analytics page does link into the app; the home page also pushes `hero_check_found` and
  `hero_check_failed`; the published app never sends `trial_start`), and the hosting
  account name, SSH address and port, and the admin usernames were taken out of the
  documents, because every file here is served on the public website. They remain in this
  public repository's git history; none of them is a password.

- The three open app pull requests have had **no Codex review and no CI run** either (same
  "usage limits" comment, 2026-09-19). #6 is one document, #7 is four lines of CI
  configuration, #2 is the one guard line; read in full, all as described. For
  [#5](https://github.com/richducat/home-inspection-assistant/pull/5) (48 lines of app code)
  three independent reviewers and four skeptics found **no defect**: the accounts server
  does send `planId` (since 2026-07-09, always one of `trial`, `payg`, `monthly`,
  `unlimited`, `annual`), no username or email reaches analytics, nothing else builds an
  account without the new field, and the guard is byte-identical to the website's. Static
  reading only; its tests were not run here. Merging #5 puts it on that repo's `main`,
  where the "Validate app" workflow runs the tests; nothing reaches inspectors until
  `deploy-hip.sh` runs.
- Seen in passing in the accounts API and **not verified**: a legacy account still in
  `trialing` status that buys a $5 single report keeps that status, and clean (unwatermarked)
  reports appear to require `active`, so that customer may stay watermarked after paying
  (`hip-accounts-api/src/stripe.mjs`, `activateFromCheckout`). Worth a look by an engineer.

### Found by the 2026-09-21 review, not fixed yet (needs a session that can run `npm run mobilecheck`)

| Severity | What | Where |
|---|---|---|
| Medium (test tool only) | The mobile check opens pages as `file://`, and `lp01` to `lp05` link their stylesheet as `/assets/site.css`, so those five pages were measured **without their stylesheet**. The "0 overflowing" result does not cover them. Serve the root-absolute path from `--root` in the script's route handler, then re-measure | `tests/mobile-overflow-check.cjs` line 150 |
| Medium (test tool only) | If the Google Fonts stylesheet cannot be fetched, the check prints no warning and measures with fallback fonts, which hide overflow | `tests/mobile-overflow-check.cjs` line 92 |
| Low | On phones, `wind-mitigation.html` loses its only link to `forms.html` (the new rule hides top-bar links, and no footer on the seven affected pages links to Forms, contrary to the comment in the CSS). Add a Forms link to those footers | `assets/site.css` line 210 |
| Low | For up to 10 minutes after the merge, a returning visitor can get the new `pricing.html` with the old cached stylesheet (the stylesheet URL has no version), and see the pricing cards in the default layout. It clears by itself | `pricing.html` line 89 |

### Verified earlier (2026-09-19)

- Tests: 15 of 15 pass on the branch (`npm test`) and on `main` (there via
  `node --test tests/marketing-analytics.test.cjs`, because `main` has no `package.json`
  until this PR merges).
- Mobile: 0 of 115 page-widths overflow on the branch at 320, 375, 540, 600 and 601 px.
  On `main` (measured with `node tests/mobile-overflow-check.cjs --root <main worktree>`),
  14 of 46 overflow at 320 and 375 px: pricing, coverage, faq, forms, product, trust and
  wind-mitigation.
- Screenshots at 601, 768 and 1280 px are byte-identical to `main` on all 23 pages with
  animations frozen (the home page animates, so compare it with animations disabled or by
  eye), and the 4-point page is identical at every width. Only phone widths differ, and
  only in the top bar, the home header and the stacked pricing cards.
- All 24 GTM loaders carry the identical hostname guard; the internal-traffic flag precedes
  the loader on all 23 marketing pages (the app shell has never had the flag); the tracker
  script set is unchanged from `main`; the loader was executed in a sandbox and in real
  Chromium for nine hostnames and loads on the two production hosts only.
- `<meta charset>` is at byte 40 on every marketing page (was 1561 / 1429).
- The only change under `app/` versus `main` is PR #3's one-line guard in `app/index.html`
  (commit 35f40ca); the same line is in app PRs #2 and #5. The branch merges cleanly into
  `main` in any order with PR #3.
- App repo branch for PR #5: 427 tests, typecheck, build, budget about 132.9 KB gzip
  against a 133,120 B target (the figure drifts by tens of bytes between builds; `main`
  measures the same to within 50 bytes), score 100 / 100.
- Five independent verifiers audited the branch line by line (diff, analytics runtime,
  visual regression, merge and deploy safety, HTML head integrity); two layout regressions
  they found were fixed before the PR was opened. Five "fresh eyes" personas then tried to
  work from these documents alone; their corrections are folded in.

### Still unverified

- `app_open_click` in production GA4 and the GA4 internal-traffic filter (issue #7).
- Whether the GTM container has tags for the `lp_*`, `check_*` and app events.
- The non-Mac app deploy paths in `RUNBOOK.md` section 6 have never been exercised, and
  the CI-artifact one cannot work until [home-inspection-assistant #7](https://github.com/richducat/home-inspection-assistant/pull/7)
  merges (it makes that workflow build with the production base path).
- Anything on the owner's Mac (issue #8, #10).

### In flight

**The pricing change (prepared 2026-09-21, not launched).** Four coordinated changes, built
and adversarially reviewed together; none is merged, none is visible to customers:

| Where | State |
|---|---|
| Accounts API | [hip-accounts-api #2](https://github.com/richducat/hip-accounts-api/pull/2), CI green (69 tests). Behaves exactly as today until the new app asks for the new offer. Goes on the host first, after a database backup |
| Records API | [hip-records-api #2](https://github.com/richducat/hip-records-api/pull/2), CI green. One sentence; merging auto-deploys to Render |
| App | [home-inspection-assistant #9](https://github.com/richducat/home-inspection-assistant/pull/9), CI green (442 tests, score 100). Refuses to open Stripe unless the server confirms the new offer, so a wrong-order deploy cannot sell a wrong price. Deploy only at launch |
| This website | branch `claude/pricing-50-500`, **held locally** on the owner's Mac in `~/GITHUB/_pricing_work/inspection-rent` (this repository is public, so pushing it would announce the prices early). 20 tests pass; 0 of 69 page-widths overflow at 320, 375 and 768 px; no old price visible on any page. Before merging: `npm run launchcheck -- <launch date>` sets the terms date and sitemap dates |

Launch is gated on the wind-mit service being back (owner's decision). Existing subscribers,
their prices and limits, and credits already bought are untouched by all four changes.

Otherwise nothing half-done. Stale branches kept on purpose (the owner asked that nothing be deleted):
here `claude/app-error-review-o46y68` (its one commit was cherry-picked into #16) and the
merged PR branches; in the app repo `claude/app-issues-beth-aicohr` (2026-08-26, never
merged; see issue #15) and the merged PR branches.

## Earlier

- 2026-09-11 01:10 to 01:23: site PRs #4, #5, #6 merged (evening of 09-10 in Florida).
- 2026-09-10: app deploys `0c7b78a` and `bfabccd` (app PRs #3 and #4); both APIs patched
  for the query-parser advisories.
- 2026-09-07: site PRs #1 and #2 merged within two minutes of opening; Codex's three
  findings arrived afterwards and were never answered (charset position, fixed 2026-09-19;
  patched bundle keeping its hash, moot after the 09-10 rebuild; single-report plan label,
  fixed in app PR #5).
- 2026-09-01: Claude session "App error review" produced the 320 px fix on a branch and
  ended disconnected, so it was never reported or merged.
- 2026-08-06 to 08-18: app deploys on 9 of those 13 days (permit correctness, cross-verification, wind
  speed counties, offline hardening, free card-less signup); see `DECISIONS.md`.
- 2026-07-18: the shared cPanel host wedged and took the accounts API down; the Render
  migration was prepared in response and has not been run.
