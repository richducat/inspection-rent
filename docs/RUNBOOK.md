# Runbook

Step-by-step instructions for the recurring jobs. Commands assume Node 22 and a checkout
of this repository. "PR" means a pull request to `main`, reviewed by Codex, merged by the
owner.

## 1. Is the site healthy right now?

```bash
curl -sI https://inspection.rent/ | grep '^HTTP/' | tail -1                   # HTTP/2 200
curl -sI https://inspection.rent/app/ | grep '^HTTP/' | tail -1               # HTTP/2 200
# (the last HTTP/ line is the real status; behind the cloud sandbox proxy the first one is
#  the proxy's own "HTTP/1.1 200 Connection Established")
curl -s  https://inspection.rent/ | grep -c 'assets/marketing-analytics.js'   # 1
curl -sS https://hip-records-api.onrender.com/health                          # {"ok":true,...}
curl -sS https://accounts.eb28.co/health                                      # {"ok":true,...}
```

Then open the Actions tab and confirm the latest "Deploy to GitHub Pages" run is green.
A red run means the live site is still on the previous commit: open the run and press
"Re-run all jobs", or Actions → Deploy to GitHub Pages → "Run workflow" on `main`. A
cancelled run is normal when two merges land minutes apart (the newer one wins). Ignore
the second workflow in that tab, "pages build and deployment": it is GitHub's legacy
builder, dead since 2026-08-06, and its last runs are red. To see which commit is live,
`curl -sI https://inspection.rent/ | grep -i last-modified` matches the finishing time of
the deploy run.

## 2. Run the checks

```bash
npm test               # 15 tests on assets/marketing-analytics.js
npm run mobilecheck    # loads all 23 marketing pages at 320 and 375 px; must print "0 overflowing"
```

`mobilecheck` needs Playwright. On a laptop, once: `npm install --no-save playwright && npx playwright install chromium`
(`--no-save` keeps `package.json` and the lockfile untouched; `node_modules/` is git-ignored;
never commit either). In a Claude Code cloud session Playwright and Chromium are
preinstalled; run it with `NODE_PATH=$(npm root -g) npm run mobilecheck`. Flags:
`--widths 320,375,600`, `--only pricing.html,coverage.html`, `--root <other checkout>` (to
measure `main` or a worktree), `--shots /tmp/shots` (full-page screenshots; keep the
directory outside the repo, `shots/` is a tracked folder of product images).

## 3. Change an existing marketing page

1. Branch from `main`. Edit the page. Keep the `<head>` order (charset, internal-traffic
   flag, guarded GTM loader) untouched.
2. If you changed a price or a plan name, grep for the old value across every page
   (`grep -rln '\$20' *.html lp/*.html`): the $20 price alone appears on 22 of the 23
   analytics pages, every page except `privacy.html`. Pricing is also under review (issue #12).
3. Run the checks (section 2). Open the PR with the template. Update `docs/STATUS.md`.

## 4. Add a new page

**Indexable root page** (a product or topic page that search engines should find):

1. Copy `coverage.html`. Keep its first 19 lines verbatim: charset, internal-traffic flag,
   guarded GTM loader, `<!-- End Google Tag Manager -->`.
2. Set `<title>`, the meta description, and
   `<link rel="canonical" href="https://inspection.rent/<name>.html">`.
3. Keep the `<noscript>` GTM iframe right after `<body>` and the
   `<script src="assets/marketing-analytics.js" defer></script>` before `</body>` (every
   analytics page has it, whether or not it links to the app).
4. Add it to `sitemap.xml` and link it from at least one existing page.

**Campaign page** (an ad or outreach destination under `lp/`):

1. Copy the closest existing `lp/lpNN.html` to the next number (see `CAMPAIGNS.md`).
2. Change `<title>`, the meta description, every CTA `href="/app/?v=lpNN"`, and the campaign
   id in the inline snippet: `lp01` to `lp05` set `var LP = "lpNN"` once; `lp06` to `lp10`
   repeat `lp:'lpNN'` in each `dataLayer.push` (two pushes, three on `lp08`). Run
   `grep -n lpNN lp/lpMM.html` on the copied page and change every hit, or the new page
   reports as the old campaign.
3. Keep `<meta name="robots" content="noindex,nofollow">`, no canonical, and the
   `../assets/marketing-analytics.js` path (and `../assets/site.css` on `lp01` to `lp05`;
   `lp06` to `lp10` carry their own styles). A root-relative `assets/...` would 404 from
   under `lp/`. Do not touch `sitemap.xml`.
4. Add a row to `CAMPAIGNS.md`.

**Both:** run `npm run mobilecheck` (new pages are picked up automatically) and confirm
`grep -c "gtm.start" <file>` = 1, `grep -c "h!=='inspection.rent'" <file>` = 1, and
`grep -c "assets/marketing-analytics.js" <file>` = 1. Whether the GTM container has a
trigger and tag for a new event name is a separate, owner-side step (`ANALYTICS.md`).

## 5. Deploy the marketing site

Merging into `main` is the deploy. The Actions run usually takes 20 to 30 seconds but can
queue for ten minutes or more on a bad day; then verify with section 1.
The CDN caches pages for 10 minutes (`cache-control: max-age=600`), so a hard refresh may
be needed to see a change.

## 6. Deploy the app

The app is built from `richducat/home-inspection-assistant` and copied into `app/` here.

**Normal path (owner's Mac):** in the app source checkout, `./deploy-hip.sh "message"`.
The script refuses to push unless: the source is fast-forwarded to `origin/main`; the build
succeeds with the production `VITE_*` values it exports; the built `index.html` references
`/app/` assets that all exist; and every feature marker in its `FEATURES` list is present in
the shipped JavaScript. It then rsyncs `dist/` over `app/` (deleting stale files), commits,
and pushes `main` here, which triggers the Pages deploy.

**Fallback A, by hand from any machine (not yet exercised):** clone both repositories side
by side, then in the app repository:

```bash
npm ci
export VITE_GOOGLE_CLIENT_ID="732061845842-1vvheh01ra9u0akuvvo1vese7c7opalt.apps.googleusercontent.com"
export VITE_ACCOUNTS_API_URL="https://accounts.eb28.co"
export VITE_RECORDS_API_URL="https://hip-records-api.onrender.com"
export VITE_WINDMIT_API_URL="https://richards-macbook-pro.tail44c237.ts.net"
npm run score                      # must print 100 / 100
HIP_BASE_PATH=/app/ npm run build  # dist/
rsync -a --delete --checksum dist/ ../inspection-rent/app/
```

Then repeat what `deploy-hip.sh`'s `verify()` checks: `app/index.html` references
`/app/assets/index-*.js` and nothing under `/HIP/app/`; every asset it references exists;
each feature marker in the script's `FEATURES` list appears somewhere in `app/assets/*.js`.
Commit as `Deploy <app commit> from source` and open a PR here. (These four `VITE_*` values
are public browser configuration, copied from `deploy-hip.sh`; they are not secrets.)

**Fallback B, CI artifact (not usable yet):** every push to the app repo's `main` runs its
"Validate app" workflow, which tests, typechecks, builds, checks the bundle budget, and
uploads a `validated-app` artifact. As of 2026-09-19 that build does **not** set
`HIP_BASE_PATH=/app/`, so its `index.html` points at `/home-inspection-assistant/assets/...`
and would white-screen at `inspection.rent/app`. A one-line change to the workflow's build
step (`HIP_BASE_PATH: /app/`) fixes that: [home-inspection-assistant #7](https://github.com/richducat/home-inspection-assistant/pull/7).
Once merged: artifacts expire after 7 days, so if the latest run shows none, open Actions →
Validate app → "Run workflow" on `main`; the zip holds the *contents* of `dist/` with no
`dist` folder, so `unzip validated-app.zip -d dist`, then rsync as in fallback A, run the
same checks, commit, PR.

Never edit `app/` by hand for any other reason.

## 7. Roll back

- **Marketing site:** `git revert <merge commit>` on a branch, PR, merge. Pages redeploys
  the previous content in under a minute.
- **The app:** revert the "Deploy ..." commit the same way; `app/` is just files. Or re-run
  `deploy-hip.sh` from an older source commit.
- **Records API:** Render dashboard → the service → "Rollback to previous deploy".
- **Accounts API code:** it deploys by copying `src/` to the cPanel app directory and
  touching `tmp/restart.txt`; roll back by copying the previous commit's `src/` the same
  way (section 12).
- **Accounts database:** `hip-accounts-api/scripts/restore-db.sh` restores a snapshot from
  the Mac's `~/hip-backups`; read `RESTORE.md` in that repo first. This is the only copy
  of the inspectors' work besides the host disk.

## 8. Handle a Codex review

Codex reviews every pull request. It reacts with 👀 while working, posts a "Codex Review
Summary" comment, and leaves inline threads with a P1 (fix before merge) or P2 (fix or
answer) badge. Observed timing: 2 to 8 minutes after opening when the bot has quota. Do not merge
until the summary says Completed and every thread has either a fix or a reply saying why not; then
resolve the threads. Comment `@codex review` to re-run it. On 2026-09-07 two PRs were merged
within two minutes of opening and three findings were lost. Note: on 2026-09-19 the bot
reported "usage limits reached"; if it stays silent, say so in the PR and ask the owner.

## 9. Verify analytics

Needs the owner's Google account.
1. On the device you are testing from, load any page once with `?internal=1`. Your hits
   are now tagged `traffic_type=internal` until you load `?internal=0`. Automation browsers
   are tagged automatically.
2. GA4 → Realtime, filter by the event (`app_open_click`, `check_search`, `sign_up`,
   `begin_checkout`, `checkout_return`). Or GTM → Preview on the page.
3. Local, preview, and lookalike hosts never load the container (hostname guard), so test
   on the live domain only.
4. Record in `docs/STATUS.md` which events you saw arrive. As of 2026-09-19 nobody has
   confirmed `app_open_click` from an ordinary same-tab click in production.

## 10. Where the logs are

- Marketing site: none beyond the Actions run log. Nothing reports client errors.
- Records API: Render dashboard → service → Logs, plus `GET /health/pulls` (per-pull
  telemetry, address-free) and the `deploy` marker in `GET /health`.
- Accounts API: the server writes almost nothing (a handful of console lines, no request
  log), and no repository says where cPanel keeps even that; the usual place is cPanel →
  "Setup Node.js App" and a `stderr.log` in the app directory (inference). Diagnose with
  the checks in section 15 instead of looking for logs.
- App crash reports: the app posts them to `POST /client-errors` on the accounts API; read
  them at `GET /admin/client-errors` or in the app's Admin panel, both of which need an
  admin sign-in (section 11).

## 11. Admin operations on the accounts API

Two admin accounts, `beth` and `richard`, are seeded from the host's `ADMIN_PASSWORD`
(the server refuses to start with a default password). With an admin token,
`GET /admin/accounts` lists accounts and `POST /admin/accounts/<username>` takes `action` =
`activate` | `deactivate` | `set_plan` | `add_credits` | `set_password` (the last one is
missing from the server's own error text),
`GET /admin/leads` lists the leads the marketing pages collect, and
`GET /admin/client-errors` lists app crash reports. Inspectors delete their own account with
`DELETE /account`. Routes and shapes: `hip-accounts-api/src/server.mjs`. Nobody currently
reads the leads; the site promises those visitors a property report by email (issue #15).

## 12. Deploy the accounts API (what is known)

The live service is the cPanel Node app in `/home/tyfyprbm/hip-accounts-api` on the
Namecheap host (SSH `tyfyprbm@162.213.253.62`, port 21098, key `~/.ssh/hip_deploy_ed25519`
on the owner's Mac; see `hip-accounts-api/scripts/restore-db.sh` and
`deploy/backup-and-watch.sh` for the exact connection). `home-inspection-assistant/CLAUDE.md` (its
backends table; `hip-accounts-api` has no `CLAUDE.md`) describes the deploy as
`rsync src/` then `touch tmp/restart.txt`. Unknown and to be confirmed by the
owner: the exact rsync source and flags, whether `npm install` runs on the host, and whether
cPanel needs a manual restart. Always take a database backup first (`RESTORE.md` in that
repo), and verify with `curl -sS https://accounts.eb28.co/health` afterwards. The Render
deployment described in that repo's `DEPLOY.md` does not exist (issue #9).

## 13. Deploy the records API

Push to `main`; Render builds the Docker image and swaps traffic only when the new instance
boots (a build that dies on boot keeps the old one serving, which is how a missing `COPY`
line once hid for days; CI now checks the Docker copy list). Bump the `deploy` marker string
in `GET /health` in the same commit and confirm it live:
`curl -sS https://hip-records-api.onrender.com/health`. Roll back from the Render dashboard
("Rollback to previous deploy"). If paying inspectors get 401 or 503 on property research,
follow the emergency page at the top of `hip-records-api/RUNBOOK.md`.

## 14. If the owner's Mac is unavailable

The system map lists what runs only there. Immediately:

1. App deploys: use section 6, fallback A or B.
2. Backups: the hourly `accounts.db` snapshot has stopped. Take one by hand from cPanel's
   File Manager (it works even when the Node apps are wedged) and keep it somewhere safe.
3. Wind-mitigation analysis is off; the app degrades to manual answers. Tell Beth.
4. Outage and signup alerts have stopped; check `curl` health endpoints by hand until the
   watch is restored.

Writing this into a proper runbook, with the guides that live only on that machine, is
issue #10.

## 15. Inspectors cannot sign in

In this order:

1. `curl -sS https://accounts.eb28.co/health`: JSON with `"ok":true` means the Node app
   is up. HTML, a 5xx, or a hang means it is not: restart it from cPanel → "Setup Node.js
   App", and if it will not come back the shared host has hit its process limit, which only
   Namecheap support can clear (`hip-accounts-api/RESTORE.md`). Tell the owner; the Mac's
   hourly watcher normally iMessages him about exactly this.
2. Probe the sign-in path with bogus credentials:
   `curl -sS -X POST https://accounts.eb28.co/auth/login -H 'content-type: application/json' -d '{"username":"probe","password":"wrong"}'`
   A JSON 401 "Invalid username or password" means sign-in works and the problem is the
   account: a 402 means the subscription is pending or lapsed (billing), a 429 means the
   rate limit. HTML or a 5xx means the app is down (step 1) or the host's WAF is blocking
   JSON posts, which happened on 2026-08-06.
3. Confirm the live app points at the right backend:
   `curl -s https://inspection.rent/app/ | grep -o 'assets/index-[^"]*'` then grep that file
   for `accounts.eb28.co`.
4. During an accounts outage, property research returns "503 retryable" too, because the
   records API validates every session against `/auth/me`. That is expected, not a second
   incident.
5. If the database is suspect, do not guess: `RESTORE.md` and `scripts/restore-db.sh` in
   `hip-accounts-api`, with the owner on the line.
