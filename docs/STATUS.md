# Status

The living ledger. Update it at the end of every session, in the same PR as the work.
Newest entry first. Dates and times are UTC. A reader should be able to start from here alone.

## Last updated: 2026-09-21 17:35 UTC (Claude Code session on the owner's Mac; everything below the merges is on `main`)

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
| A key named `hip_claude_ed25519` | Seen in cPanel at 17:25 UTC: **no key of that name existed.** `hip_deploy_ed25519` is there and authorized (so the older Mac can get in and cPanel needed no change for it), along with two other authorized deploy keys whose holders the owner should identify (issue #14); no private keys are stored on the server. A new pair named `hip_claude_ed25519` was then created on the current Mac (private half stays in `~/.ssh`), and its public half was put into cPanel's Import form for the owner to press Import and then Authorize | Verified. Whether the owner completed the import: check with the SSH test in `RUNBOOK.md` section 12 |
| Hourly backup of the accounts database, outage and signup alerts, keep-warm | Not set up on this Mac | Verified for this Mac. Whether an older Mac still does them: only you know |
| Wind-mit AI photo analysis | Its address no longer exists on the internet (`NXDOMAIN` from three DNS resolvers) | Verified it cannot be reached; believed failing for every inspector |
| `deploy-hip.sh` (step 4 below) | Could not run in the morning. By 16:53 UTC it had: Homebrew, `gh`, a GitHub sign-in, Node 22 (`brew install node@22`, keg-only, so prefix `PATH` with `/opt/homebrew/opt/node@22/bin`), and a fresh app clone outside iCloud at `~/GITHUB/home-inspection-assistant` | Verified by deploying |
| Sign-in, sync, billing (accounts) and property research (records) | Both health checks answered `ok` at about 2026-09-21 15:45 UTC | Verified |
| The live website | Up (HTTP 200), with the analytics guard and the phone fix since 16:31 UTC | Verified |

**Two questions only you can answer** (reply on [issue #10](https://github.com/richducat/inspection-rent/issues/10)):

1. ~~Is the older Mac still switched on?~~ **Answered 2026-09-21: yes, it is on.** So the
   hourly backups and alerts are believed to be running there. Still worth one look on that
   Mac: the newest file in `~/hip-backups` should be less than an hour old. The wind-mit
   service also lives there and is unreachable (step 6), so something on that Mac changed.
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
