# Status

The living ledger. Update it at the end of every session, in the same PR as the work.
Newest entry first. Dates and times are UTC. A reader should be able to start from here alone.

## Last updated: 2026-09-21 (Claude Code session on the owner's Mac, branch `claude/relaxed-knuth-1vy6x9`)

### Read this first: the Mac you use now is not "the owner's Mac" in these documents (found 2026-09-21)

This session ran on your Mac instead of in the cloud, so for the first time somebody looked.
The user account on this Mac was created on 2026-09-11. It has the website folder and a
copy of the app's source, but none of the machinery the documents say runs "on the owner's
Mac". The table is in `SYSTEM-MAP.md` under "Which Mac?". What it means for you:

| What | State on 2026-09-21 | Verified or believed |
|---|---|---|
| SSH key `~/.ssh/hip_deploy_ed25519` | Not on this Mac; the hosting server refused the login | Verified |
| A key named `hip_claude_ed25519` | Not on this Mac either, so authorizing it in cPanel would not let this Mac in. **Not authorized by this session**; see the note below | Verified it is not here; where its private half lives is unknown |
| Hourly backup of the accounts database, outage and signup alerts, keep-warm | Not set up on this Mac | Verified for this Mac. Whether an older Mac still does them: only you know |
| Wind-mit AI photo analysis | Its address no longer exists on the internet (`NXDOMAIN` from three DNS resolvers) | Verified it cannot be reached; believed failing for every inspector |
| `deploy-hip.sh` (step 4 below) | Cannot run here yet: no `node`/`npm`, and this folder is on the PR branch instead of `main`. The GitHub sign-in was added the same afternoon (Homebrew and `gh` installed by the owner) | Verified |
| Sign-in, sync, billing (accounts) and property research (records) | Both health checks answered `ok` at about 2026-09-21 15:45 UTC | Verified |
| The live website | Up (HTTP 200); still without the analytics guard because PR #16 is not merged | Verified |

**Two questions only you can answer** (reply on [issue #10](https://github.com/richducat/inspection-rent/issues/10)):

1. Is the older Mac (the one named "richards-macbook-pro") still switched on somewhere? If
   yes, the backups and alerts are probably still running there and the SSH key is on it.
   If no, there has been **no backup of the accounts database since about 2026-09-11**:
   take one by hand today (cPanel → File Manager, `RUNBOOK.md` section 14 step 2).
2. Where did the cPanel key named `hip_claude_ed25519` come from? A key in that list lets
   whoever holds its private half into the server once authorized. If you do not know who
   holds it, delete it instead of authorizing it. The safe way to give this Mac access is
   in `RUNBOOK.md` section 12 (make a new key on this Mac, import only its public half).

### This week, in order (owner)

You never need to run a command for steps 1 to 3; each is a link and a button, and they
work from any browser. **Step 4 cannot be done from your current Mac yet** (see above); do
steps 1 to 3 anyway, the website fix does not depend on step 4.

1. **Merge the app fix.** Open [home-inspection-assistant #5](https://github.com/richducat/home-inspection-assistant/pull/5),
   scroll to the bottom, press the green **Merge pull request**, then **Confirm merge**.
   Then open [#2](https://github.com/richducat/home-inspection-assistant/pull/2) and press
   **Close pull request** (it is the same one-line change, written by Codex the same day).
2. **Merge the two small ones.** Open [home-inspection-assistant #6](https://github.com/richducat/home-inspection-assistant/pull/6)
   and [#7](https://github.com/richducat/home-inspection-assistant/pull/7) and merge each the
   same way.
3. **Merge this repository's pull request** [#16](https://github.com/richducat/inspection-rent/pull/16)
   (the one that added this file). Then open [PR #3](https://github.com/richducat/inspection-rent/pull/3)
   and press **Close pull request** with the comment "superseded". About 30 seconds later
   the website is updated; the [Actions tab](https://github.com/richducat/inspection-rent/actions)
   shows a green check next to "Deploy to GitHub Pages".
4. **Rebuild the app from a Mac that can.** On the Mac that did the 2026-09-10 deploys: open
   Terminal, go to the hip-app-work folder, run
   `./deploy-hip.sh "Deploy the analytics guard"`. It ends with "DONE, inspection.rent
   deployed and verified" in about a minute. If it prints ABORT, paste the message into a
   new issue here. On your current Mac this cannot work until three things are set up
   (`RUNBOOK.md` section 6 lists them; the GitHub sign-in is done, `node` and switching the
   website folder to `main` remain); ask an engineer or a Claude session on the Mac to do that
   with you. Nothing breaks for inspectors while step 4 waits; the app keeps running the
   2026-09-10 build.
5. **Answer the pricing question** by replying on [issue #12](https://github.com/richducat/inspection-rent/issues/12)
   with what $98 buys today.
6. **Wind-mit service:** no need to test from your phone any more. On 2026-09-21 its
   address did not exist on the internet at all, so it is down for everyone. What is left
   for you on [issue #8](https://github.com/richducat/inspection-rent/issues/8): say whether
   the older Mac that ran it still exists, and whether you want the feature back.
7. **Two analytics checks** in your Google account, click by click in [issue #7](https://github.com/richducat/inspection-rent/issues/7).

**What your inspector sees today:** sign-in, saved inspections, forms, billing and permit
pulls answered their health checks on 2026-09-21 and are believed working; the wind-mit
AI photo analysis is believed down for everyone (step 6), so she answers those questions
from the photos herself; the marketing pages scroll sideways on phones until step 3 lands,
which does not affect the app itself.

### Production right now (as of 2026-09-19 18:30 UTC; re-checked 2026-09-21 15:45 UTC: `main` still `b35fa2d`, Pages run 52 still the latest and green, site HTTP 200, guard still absent live)

- `main` at `b35fa2d` is live (Pages run 52, green). Every Pages run since run 11 on
  2026-08-10 has been green; runs 1 to 4 and 6 on 2026-08-06 failed and run 5 was cancelled
  while the workflow was being introduced, and run 10 was cancelled by a newer push.
- The live pricing page still has the three-column grid that breaks on phones; seven
  pages scroll sideways at 320 and 375 px. The fix is in the PR from this branch.
- No GTM loader on the live site has the hostname guard yet (PR #3 was never merged), so
  localhost and preview visits still reach GA4.
- The accounts API runs on the shared cPanel host, not Render. The records API is on Render.
- The wind-mitigation service: on 2026-09-21 its hostname returned `NXDOMAIN` from the
  owner's own network and from 1.1.1.1 and 8.8.8.8, so it is unreachable for everyone
  (issue #8). On 2026-09-19 it had only been unreachable from the cloud sandbox.
- A stale copy of the app (built before 2026-08-06) is still live at `eb28.co/HIP/app/`
  against production backends (issue #13).
- The Codex review bot reported "usage limits reached" on 2026-09-19; pull requests opened
  today may not get its review.

### Open pull requests, in the order to merge them

| Order | PR | What | Why this order |
|---|---|---|---|
| 1 | [home-inspection-assistant #5](https://github.com/richducat/home-inspection-assistant/pull/5) | GTM guard in the app shell source; `checkout_return` records the real plan id | Must be on that repo's `main` before the next `deploy-hip.sh`, or the deploy erases the guard from `app/index.html` here. Supersedes [home-inspection-assistant #2](https://github.com/richducat/home-inspection-assistant/pull/2) (Codex, 2026-09-08, the same one line); close #2 |
| 2 | [home-inspection-assistant #6](https://github.com/richducat/home-inspection-assistant/pull/6) and [#7](https://github.com/richducat/home-inspection-assistant/pull/7) | `AGENTS.md` pointer brief (part of issue #11); CI builds its artifact with the production base path (part of issue #10) | Docs and CI only, any time |
| 3 | [inspection-rent #16](https://github.com/richducat/inspection-rent/pull/16) (branch `claude/relaxed-knuth-1vy6x9`) | PR #3's guard on all 24 loaders, the 320 px fix, charset first, the mobile check, and this documentation | Contains PR #3's commit, so [PR #3](https://github.com/richducat/inspection-rent/pull/3) can be merged first or closed as superseded; either way the resulting tree is identical |
| 4 | run `./deploy-hip.sh` on the Mac | Rebuilds `app/` from a `main` that carries the guard | Makes the source and the published copy identical again |

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

This documentation and the fixes are on branch `claude/relaxed-knuth-1vy6x9` until
[PR #16](https://github.com/richducat/inspection-rent/pull/16) merges. The stale branch `claude/app-error-review-o46y68` (2026-09-01): its one commit
`058dcea` was cherry-picked here as `245741a`, so it is not an ancestor; delete it by name
after the merge (`git push origin --delete claude/app-error-review-o46y68`). In the app
repo, `claude/app-issues-beth-aicohr` (2026-08-26) was never merged; see issue #15.

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
