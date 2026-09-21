# AGENTS.md — operating brief for inspection.rent

Read this first, whoever you are: a new engineer, Claude, Codex, or any other assistant.
It is the working contract for this repository. `CLAUDE.md` imports it, so Claude Code
sees the same text. Edit this file, never a copy.

## What this repository is

- The public marketing site for **Inspector Gadgets** at https://inspection.rent. Plain
  HTML and CSS, no framework, no build step. 24 HTML files: 14 root pages listed in
  `sitemap.xml` (one of them `refunds.html`, a meta-refresh stub to `terms.html#refunds`
  with no analytics, still marked `index,follow`), and 10 campaign landing pages
  `lp/lp01.html` to `lp/lp10.html` (`noindex,nofollow`, not in the sitemap, each with its
  own tracking snippet; registry in `docs/CAMPAIGNS.md`). So 23 pages carry analytics, and
  there are 24 GTM loaders because the app shell `app/index.html` has one too.
- The host for the **built app** at https://inspection.rent/app. Everything under `app/`
  is generated in `richducat/home-inspection-assistant` and copied here by that repo's
  deploy script.
- Hosting is GitHub Pages. `.github/workflows/pages.yml` publishes the repository root on
  every push to `main` (usually 20 to 30 seconds, occasionally queued for ten minutes); the
  custom domain comes from `CNAME`.
- Owner: Richard Ducat (`richducat`). He is not a programmer and needs plain-language
  reporting. The app's daily user is Beth, a working home inspector in Brevard County,
  Florida, who works from a phone. Other paying accounts exist; how many is a question
  for the owner.

## The documents, in reading order

1. This file.
2. `docs/STATUS.md`: where things stand, open pull requests and issues in this repo and
   the app repo, what the owner must do next. Updated at the end of every session.
3. `docs/SYSTEM-MAP.md`: every repository, service, domain and account, what breaks when
   each is down, and which documents in the sibling repositories to trust.
4. `docs/RUNBOOK.md`: how to do each recurring job, step by step.
5. `docs/ANALYTICS.md`: the GTM / GA4 setup and every event the site and app send.
6. `docs/DECISIONS.md`: why things are the way they are, dated, with sources.
7. `docs/CAMPAIGNS.md`: the campaign landing pages and their tracking values.

`README.md` is the human front door and links the same set. `.github/pull_request_template.md`
is the checklist every PR fills in.

## Rules that protect what is already built

1. **Never hand-edit anything under `app/`.** It is the build output of
   `richducat/home-inspection-assistant`. That repository's `deploy-hip.sh` rsyncs the
   new build over `app/` with `--delete` and pushes `main`, so any edit made here is
   erased on the next deploy. Fix the source repository, then deploy. The one exception
   on record: PR #3 put the GTM hostname guard straight into `app/index.html` (a single
   line). The app repository's PR #2 (Codex, same day) and PR #5 carry the same line in
   the source; once one of them merges and the app is deployed, the copies match again.
2. **Every marketing page keeps this `<head>` order:** `<meta charset>` first, then the
   internal-traffic flag script, then the GTM loader with the production-hostname guard,
   then everything else. New root pages copy the head of `coverage.html`; new campaign
   pages copy an existing `lp/` page (rule 10).
3. **Do not change or remove analytics plumbing:** container `GTM-PX3ZXWR6`, measurement
   id `G-36J97SMTD7`, the internal-traffic flag, the hostname guard, the `noscript` GTM
   iframe, `assets/marketing-analytics.js` (loaded on all 23 analytics pages), and the
   inline `lp_*` and `check_*` snippets. `docs/ANALYTICS.md` explains each piece.
   On any host other than `inspection.rent` the guarded loader returns before it creates
   `window.dataLayer`, so every inline snippet that pushes to it must start with
   `window.dataLayer = window.dataLayer || [];` (all existing ones do). Forget it and the
   snippet throws only on localhost and previews while working silently in production.
4. **No build step, no dependencies in production.** Pages serves the repository root as
   is. `package.json` only names the checks and must stay free of dependencies; install
   Playwright with `--no-save` (see recipes) and never commit `package-lock.json` or
   `node_modules/`.
5. **Phones first.** No page may be wider than a 320 px or 375 px viewport.
   `npm run mobilecheck` must print `0 overflowing` before a pull request is opened.
6. **All changes go through a pull request to `main`.** Codex reviews every PR and posts
   a "Codex Review Summary" comment; wait until it says Completed (2 to 8 minutes observed
   when the bot has quota; comment `@codex review` to re-run it; if nothing appears within
   ten minutes, say so in the PR, as on 2026-09-19 when it answered "usage limits reached"),
   then fix each finding or reply in its thread with why not, before merging. Three valid
   findings from 2026-09-07 were lost because PRs #1 and #2 were merged within two minutes
   of opening, before Codex had posted (PRs #4 to #6 were merged within seconds): the charset
   position (fixed 2026-09-19), a patched bundle keeping its old hash (moot after the
   2026-09-10 rebuild), and the single-report plan label (fixed in the app repo's PR #5).
7. **Never commit secrets.** Every file in this repository is served to the internet,
   including `tests/` and `package.json`.
8. **Say exactly what you verified.** "Tests pass" means you ran them in this checkout.
   Anything you could not verify (an event arriving in GA4, a service you could not reach
   from where you are) is listed under "still unverified" in the PR and in `docs/STATUS.md`.
   The cloud sandbox cannot reach the owner's Mac; a 502 from there says nothing about the Mac.
9. **Generated and hand-maintained files:** `app/` is regenerated (rule 1). `sitemap.xml`
   is hand-maintained; add indexable root pages to it, never campaign pages.
10. **Campaign pages** (`lp/lpNN.html`): copy an existing one, change `<title>`, the meta
    description, every `href="/app/?v=lpNN"` CTA, and every occurrence of the campaign id
    in the inline snippet (`grep -n lpNN` the copy: `lp01` to `lp05` set `var LP` once,
    `lp06` to `lp10` repeat it in each push); keep `noindex,nofollow`, no canonical,
    `../assets/` paths; add a row to `docs/CAMPAIGNS.md`.
    Full recipe in `docs/RUNBOOK.md` section 4.

## How a change flows

```
branch  →  pull request to main  →  Codex review completed and answered  →  owner merges
        →  Pages workflow runs (20 to 30 seconds)  →  verify live with curl
        →  docs/STATUS.md already updated in the PR
```

The owner merges. Do not merge your own PR unless the owner has said so in writing.

## Session protocol

**At the start of a session**
1. Read `docs/STATUS.md`, then the open pull requests and issues here **and** in
   `richducat/home-inspection-assistant` (its PRs change what ends up in `app/`).
2. Check the latest "Deploy to GitHub Pages" run in the Actions tab is green.
3. Run `npm test` and `npm run mobilecheck` on your branch. For a baseline against `main`,
   check `main` out in a worktree and run `node --test tests/marketing-analytics.test.cjs`
   there and `node tests/mobile-overflow-check.cjs --root <that worktree>` from your branch
   (the script accepts `--root`, `--only`, `--widths`, `--shots`).
4. If the task touches the app, read `home-inspection-assistant/CLAUDE.md` too.

**At the end of a session**
1. Update `docs/STATUS.md`: what changed, what was verified and how, what is still
   unverified, what the owner has to do next. Commit it in the same PR as the work.
2. Fill in the pull request template honestly.
3. If work was left half-done, say so in STATUS under "In flight" with the branch name.

## Verification recipes

```bash
npm test               # analytics click-handoff tests, node:test, no install needed
npm run mobilecheck    # every marketing page at 320 and 375 px, needs playwright
npm run check          # both

# playwright for mobilecheck (one time, on a laptop). --no-save keeps package.json and
# the lockfile untouched; node_modules/ is git-ignored.
npm install --no-save playwright && npx playwright install chromium
# in a Claude Code cloud session Playwright is preinstalled: NODE_PATH=$(npm root -g) npm run mobilecheck

# is the live site serving what main has? (the last HTTP/ line is the real status; behind
# the cloud sandbox proxy the first one is the proxy's own "200 Connection Established")
curl -sI https://inspection.rent/ | grep '^HTTP/' | tail -1                    # HTTP/2 200
curl -s https://inspection.rent/ | grep -c 'assets/marketing-analytics.js'      # 1
curl -s https://inspection.rent/pricing.html | grep -c "h!=='inspection.rent'"  # 1 once the guard is live
curl -sI https://inspection.rent/ | grep -i content-type                       # text/html; charset=utf-8
```

Analytics checks need the owner's Google account (GTM preview, GA4 Realtime). Visit the
site with `?internal=1` once on a device to mark yourself internal; `?internal=0` clears it.

## Writing for the owner

Plain language. Lead with what changed and what he needs to click. Numbers go in a short
table. Always separate "verified" from "believed". Name the file only when he has to open it.
Use UTC for timestamps and say so.
