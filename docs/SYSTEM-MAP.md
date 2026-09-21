# System map

Everything Inspector Gadgets runs on, in one place. Facts were verified on 2026-09-19 by
reading the four repositories, their GitHub history, and the live endpoints; lines marked
*inference* or *unverified* were not. When you learn that something here is wrong, fix
this file in the same pull request.

**Re-checked on 2026-09-21 from a Claude Code session running on the owner's Mac itself**
(not the cloud sandbox). The short version: the Mac the owner works on today is not set up
as "the owner's Mac" this file describes. Details are in
[Which Mac? (checked 2026-09-21)](#which-mac-checked-2026-09-21) below, and the rows it
changes are marked "2026-09-21".

## The people

- **Owner:** Richard Ducat, GitHub `richducat`, `richducat@gmail.com` (also the only
  support mailbox). Not a programmer. Merges pull requests, runs the app deploy from his
  Mac, holds every third-party account. No second person has access to any of them today.
- **Daily user:** Beth, a working home inspector in Brevard County, Florida. On a phone,
  often with one hand and bad signal. Her reports feed insurance forms she signs, so a
  wrong value costs her a re-inspection. Correctness beats speed. Other paying inspectors
  have accounts on `accounts.eb28.co`; how many, and who else would notice a regression,
  is a question for the owner.

## Where things live (verified live on 2026-09-19)

| Piece | Repository | Live at | Hosting | How it deploys |
|---|---|---|---|---|
| Marketing site | `richducat/inspection-rent` (public) | https://inspection.rent | GitHub Pages | push to `main` runs `.github/workflows/pages.yml` (no build, no tests) |
| The app (built copy) | same repo, folder `app/` | https://inspection.rent/app | GitHub Pages | written by `deploy-hip.sh` from the app repo; **never hand-edited** |
| The app (source) | `richducat/home-inspection-assistant` (private) | builds into the above | none of its own (its Pages site was retired 2026-09-10) | `./deploy-hip.sh` on the owner's Mac; its CI ("Validate app") only tests, typechecks, builds, checks the bundle budget and uploads a `validated-app` artifact (built with the wrong base path until that repo's PR #7 merges) |
| Accounts API | `richducat/hip-accounts-api` | https://accounts.eb28.co | **Namecheap shared cPanel host** (LiteSpeed + Passenger). The Render service described in its `DEPLOY.md` and `render.yaml` was never created (that URL is 404) | rsync the source to `~/hip-accounts-api` on that host over SSH (key `~/.ssh/hip_deploy_ed25519` on the Mac; the SSH user, address and port are kept in the private repo's `scripts/restore-db.sh`, not in this public file) and `touch tmp/restart.txt`. Not documented in that repo; see `RUNBOOK.md` section 12. **2026-09-21:** that key file does not exist on the owner's current Mac (there was no `~/.ssh` folder at all), and an SSH login from it was refused with `Permission denied (publickey,...)`. The service itself is healthy (`/health` answered `ok:true`) |
| Records API | `richducat/hip-records-api` | https://hip-records-api.onrender.com | Render, Docker (Playwright image), plan Standard 2 GB | push to `main`; Render auto-deploys. Convention: bump the `deploy` marker in `GET /health` every deploy so the live build can be confirmed |
| Wind-mitigation photo analysis | not in any repository | https://richards-macbook-pro.tail44c237.ts.net | the owner's Mac through a Tailscale funnel | unknown. *Unverified:* the cloud sandbox cannot reach that host at all, so its state is unknown (issue #8). **2026-09-21, from the owner's own network (not the sandbox):** the hostname does not exist in public DNS (`NXDOMAIN` from the local resolver, 1.1.1.1 and 8.8.8.8), so no phone can reach it either; the app's wind-mit AI suggestions are therefore believed to be failing for every inspector. Tailscale is not installed on the owner's current Mac |
| Vision API | `richducat/hip-vision-api` (private, last push 2026-07-21; not attached to any session) | not wired: `VITE_VISION_API_URL` is unset in every build | unknown | unknown; open question for the owner (issue #10) |
| iOS shell | repository name unknown (*inference* from the app code: a WKWebView wrapper around inspection.rent/app that hides purchase UI; no repo with "ios" in its name exists under `richducat` except an unrelated one) | App Store | Apple | unknown |
| Old company site | `richducat/eb28.co` (public; Mac checkout `/Users/richardducat/GITHUB/eb28.co`, served from `docs/`) | https://eb28.co | GitHub Pages | **still serves a stale build of the app at `/HIP/app/` (from before 2026-08-06) against the production backends**, although `deploy-hip.sh` says it was retired 2026-07-14 (issue #13) |

Local paths hard-coded in `deploy-hip.sh` on the owner's Mac: the app source checkout
`/Users/richardducat/Documents/Codex/2026-06-24/is-it-possible-to-clone-our/hip-app-work`,
this repository at `/Users/richardducat/GITHUB/inspection-rent`, and the retired
`/Users/richardducat/GITHUB/eb28.co`. A second checkout of
the app repo at `/Users/richardducat/GITHUB/home-inspection-assistant` is named in that
repo's `docs/isolation-policy.md`; which one is canonical is an open question for the owner.

## How the pieces talk

```
Visitor ──> inspection.rent (static pages) ──click──> inspection.rent/app (the SPA)
                │                                          │
                │ check.html: free property check          │ sign-in, sync, billing, profile, crash reports
                ├──> geocode.arcgis.com, hazards.fema.gov   ├──> accounts.eb28.co (cPanel) ──> Stripe (Checkout, Portal, webhooks)
                └──> accounts.eb28.co/leads                 ├──> hip-records-api.onrender.com (BCPAO card, permit history, prefetch)
                                                            │       └──> validates the inspector's JWT with accounts.eb28.co and meters pulls there
                                                            ├──> richards-macbook-pro.tail44c237.ts.net (wind-mit analysis)
                                                            ├──> Google (OAuth sign-in, Calendar, Drive, Gmail drafts)
                                                            └──> public GIS: ArcGIS geocoder, Florida DOR parcels, FEMA, county wind-speed layers
Every page and the app ──> Google Tag Manager GTM-PX3ZXWR6 ──> GA4 G-36J97SMTD7
```

## External services and what breaks without them

| Service | Used by | Role | Configured where | If it is down or misconfigured |
|---|---|---|---|---|
| GitHub Pages | site, app | Hosting | `pages.yml`, repo Settings → Pages, `CNAME` | Site and app unreachable; an already-open app tab keeps working on its loaded code |
| GitHub | all repos | Source of truth, Actions, Render's deploy webhook | | Losing the account loses the only copy of the private app source |
| Namecheap | both domains, accounts API | Registrar and DNS for `inspection.rent` and `eb28.co` (nameservers `dns1/dns2.registrar-servers.com`); shared cPanel hosting for the accounts API | Namecheap account | DNS loss takes everything down at once. A cPanel process-limit lockout takes down sign-in, sync and billing; the `render.yaml` header in `hip-accounts-api` records one on 2026-07-18 and `docs/MIGRATION.md` says it happened twice that summer. While accounts is down, property research in the app also fails with "503 retryable", because the records API checks every session against accounts |
| The owner's Mac as a monitor | accounts API, records API | An hourly launchd job (`co.eb28.hipbackup`) snapshots `accounts.db` over SSH, checks both health endpoints, and iMessages the owner about outages and new signups; a second agent (`co.eb28.hipkeepwarm`) runs `~/bin/hip-keepwarm.sh` every 10 minutes to keep the records service warm | `hip-accounts-api/deploy/backup-and-watch.sh`, `hip-records-api/deploy/co.eb28.hipkeepwarm.plist` | No backups and no alerts; nobody is paged. Inspectors notice nothing directly |
| Render | records API | Hosting, auto-deploy, logs, one-click rollback | Render dashboard; `JWT_SECRET` must be pasted there | Property research loses the BCPAO card and permit history; the app falls back to link-only cards and says so |
| Stripe | accounts API, app | Subscriptions, Checkout, Billing Portal, Connect for inspector client payments, two webhooks | `STRIPE_*` env vars on the cPanel host (names in `hip-accounts-api/.env.example`, several are missing there) | New customers cannot subscribe or unlock clean reports; a wrong webhook secret after a host move silently stops activations |
| Google Cloud OAuth client | app | Sign-in for Calendar sync, Drive backup, Gmail drafts | public client id `732061845842-...apps.googleusercontent.com`, baked in by `deploy-hip.sh` and the CI variable `VITE_GOOGLE_CLIENT_ID` | Those three features fail; inspections and PDFs are unaffected. Sensitive-scope verification for calendar was "still under Google review" on 2026-08-11 |
| Google Tag Manager and GA4 | every page, the app | Analytics only | inline loader per page; `assets/marketing-analytics.js`; the app's `src/domain/analytics.ts` | No funnel data. Nothing user-facing breaks |
| Tailscale funnel to the owner's Mac | app | Wind-mit analysis; optional photo classifier (shelved 2026-07-15) | `VITE_WINDMIT_API_URL` baked into every build | Wind-mit AI suggestions fail; the inspector answers from the photos. *Unverified from the sandbox* |
| Google Fonts | marketing pages, app shell | Archivo, Public Sans, IBM Plex Mono, Newsreader, Libre Franklin | `<link>` per page | Fallback fonts; the mobile check serves the real fonts because the fallback hides overflow |
| ArcGIS geocoder, Florida DOR cadastral layer, FEMA flood layer, Brevard GIS, ten county wind-speed layers, Census and FCC geocoders | app research, `check.html`, records API jurisdiction resolution | Address to parcel, year built, flood zone, design wind speed, which office issues permits | public endpoints, no keys | The matching field is not autofilled; the app hands the inspector the portal link instead |
| BCPAO, Accela, BS&A, Tyler EnerGov, SmartGov, Palm Bay ArcGIS | records API | The county and city permit portals it scrapes with a real browser | registries in `hip-records-api/server.mjs` | That jurisdiction's permits come back `covered: false` with a portal link, never as an empty list |
| Tesseract (bundled under `app/tess/`) | app | Offline OCR of appliance plates and forms | ships with the build | Only fails if the site is down |
| Support mailbox `richducat@gmail.com` | site, app, alerts | The only human contact channel; where the Mac's alerts go | | Customers cannot reach anyone; leads sit unread |

## Everything that runs only on the owner's Mac

If this machine is off, asleep, or lost, all of the following stop at once. None of it is
in a repository, and there is no written "the Mac is dead" runbook (issue #10).

- The only deploy path for the app (`deploy-hip.sh`, see above).
- The hourly SQLite backup of `accounts.db`, the only copy of Beth's inspection data
  besides the cPanel disk (launchd job `co.eb28.hipbackup`, snapshots in `~/hip-backups`,
  30-day retention), plus the health watch, outage alerts and new-signup alerts it sends
  by iMessage.
- The records keep-warm agent (`co.eb28.hipkeepwarm`, running `~/bin/hip-keepwarm.sh` every 10 minutes).
- The wind-mitigation analysis service behind the Tailscale funnel.
- The SSH key to the cPanel host and the credentials file for the synthetic-monitor account.
- Guides referenced by the app's `CLAUDE.md` but not in git: `~/.buzz/GUIDES/EB28_OPERATING_CHARTER.md`,
  `~/.buzz/GUIDES/SOP_PERMIT_COVERAGE.md`, and a "hip-deploy-paths-and-breakit" note.

### Which Mac? (checked 2026-09-21)

Everything above was written from the sibling repositories' documents; nobody had looked at
the Mac. On 2026-09-21 a Claude Code desktop session ran on the Mac the owner uses now (a
MacBook Pro whose user account was created on 2026-09-11, the day after the last app
deploy) and looked. The wind-mit hostname says `richards-macbook-pro`, so an older Mac
probably exists or existed. **Which machine does the jobs above today, or whether anything
does, is a question only the owner can answer.**

| On the owner's current Mac | 2026-09-21 |
|---|---|
| This repository at `/Users/richardducat/GITHUB/inspection-rent` | present. It was on the PR #16 branch in the morning; put back on `main` after the merges (16:35 UTC). Check again before any deploy, see `RUNBOOK.md` section 6 |
| App source checkout at the path hard-coded in `deploy-hip.sh` | present, last fetched 2026-08-18 (`3ff099f`), **but it lives inside iCloud-synced Documents and more than 1,600 of its `.git` files were not downloaded** (`ls -lO` flag `dataless`); `git fetch` there hung for minutes. The owner's older Mac shares the same iCloud folder. Two Macs and iCloud writing one git repository is how repositories get corrupted, so **do not build or deploy from that folder**. A clean clone now lives at `/Users/richardducat/GITHUB/home-inspection-assistant` (outside iCloud); the 2026-09-21 deploy ran from it |
| `node`, `npm` | absent in the morning; **Node 22.23.2 installed about 16:45 UTC** with `brew install node@22`. It is keg-only: run things with `PATH="/opt/homebrew/opt/node@22/bin:$PATH"` |
| Homebrew, `gh` | absent in the morning; **installed by the owner at about 16:15 UTC** (Homebrew 7.0.5, `gh` 2.101.0; `~/.zprofile` now puts Homebrew on the PATH) |
| Saved GitHub sign-in for `git` | absent in the morning; **present since about 16:20 UTC** (`gh auth login` as `richducat`, stored in the macOS keychain, scopes `repo`, `read:org`, `gist`; `gh auth setup-git` run). The private repos can be fetched and this repo pushed |
| SSH to the cPanel host | `hip_deploy_ed25519` is absent here (it lives on the older Mac and is authorized in cPanel). Since 2026-09-21 18:10 UTC this Mac has its own pair, `~/.ssh/hip_claude_ed25519`, imported and authorized in cPanel by the owner; login verified |
| launchd jobs `co.eb28.hipbackup` and `co.eb28.hipkeepwarm`, `~/bin/hip-keepwarm.sh` | **absent**: this Mac takes no automatic backups and sends no alerts. `~/hip-backups` now exists and holds the manual backup of 2026-09-21 18:35 UTC. The older Mac's hourly job last reached the server on 2026-09-03 (evidence in `STATUS.md`) |
| Tailscale, the wind-mit service | **absent**; nothing is listening |
| `~/.buzz/GUIDES`, `/Users/richardducat/GITHUB/eb28.co` | **absent** |

If the older Mac is switched off or gone, then since about 2026-09-11 there has been **no
hourly backup of `accounts.db`**, no outage or signup alert, no keep-warm, no wind-mit
analysis, and no machine that can deploy the app or the accounts API. That is believed,
not verified: it cannot be checked from this Mac. `RUNBOOK.md` section 14 lists what to do
by hand in the meantime.

## Accounts the owner must keep access to

GitHub (`richducat`), Namecheap (registrar, DNS, cPanel login, SSH), Render, Stripe
(products, prices, two webhook secrets, Connect), Google Cloud Console (OAuth client),
Google Tag Manager and GA4, Tailscale (tailnet `tail44c237`), Apple Developer / App Store
Connect (iOS shell), the `richducat@gmail.com` mailbox, OpenAI/Codex (the PR review bot),
Anthropic (Claude Code). No repository names a password manager or a second person with
access (issue #14). Credentials are never stored in any repository; env var **names** are
in each API repo's `.env.example`, but the example *values* there (paths, URLs, price
variable names) are stale; the truth is `hip-accounts-api/src/config.mjs` and, for the
records API, the env block near the end of `server.mjs` plus `render.yaml` (issue #15).

## Which documents to trust in the other repositories

Every repository carries some stale text. Read these first and treat the rest with care.

| Repository | Trust | Ignore or verify first |
|---|---|---|
| `home-inspection-assistant` | `CLAUDE.md` (rules, release gate), `deploy-hip.sh` (the real deploy), `.github/workflows/deploy-pages.yml`, `scripts/score.mjs`, `docs/WIND-SPEED-SOURCES.md` | `README.md` ("Isolated GitHub Pages deployment", localhost:4173 URL: retired), `docs/isolation-policy.md` (says the repo is public and names the other checkout), `docs/implementation-plan.md` (an undated phase list from the first build; ignore), `docs/MARKETING-LAUNCH-KIT.md` lines about a GA4 `purchase` event (removed 2026-09-07), `.env.example` (lists unused vars, omits `VITE_RECORDS_API_URL` and `VITE_GOOGLE_CLIENT_ID`), `CLAUDE.md`'s bundle figures (126 KB; measured 129.8 KB) |
| `hip-accounts-api` | Read `RESTORE.md` and `docs/MIGRATION.md` first (the only files that describe the live cPanel host), then `src/config.mjs` and `src/entitlements.mjs` (the real plans and env var names), `scripts/restore-db.sh`, `deploy/backup-and-watch.sh` (what the Mac job really does) | `README.md` (says register creates `pending`; it creates a card-less `sample` account; lists one $20 plan and 16 of the 33 routes; describes an EC2 deploy), `DEPLOY.md` (presents Render as the deployment; it is not), `.env.example` (old paths and price var names), `STRIPE-SETUP.md` (old price table), the comment in `src/server.mjs` about a Render disk |
| `hip-records-api` | `CLAUDE.md`, `RUNBOOK.md` (the 401/503 emergency page; note it omits `JWT_SECRET`, `ALLOW_UNSIGNED_FAILOPEN`, `FAIL_OPEN_ON_ACCOUNTS_OUTAGE`, `REQUIRE_ENTITLEMENT`), `render.yaml`, `docs/PREFETCH.md` (except the "512 MB" instance size; it is 2 GB) | `README.md` (EC2 deploy at `records.eb28.co`, which does not resolve; `npm run dev` returns 401 unless `REQUIRE_AUTH=0`), `DEPLOY.md` frontend steps, `docs/BIG4-METRO-RECON.md` registry claims, `fixtures/coverage-baseline.json` (last recorded 2026-08-15) |

## Contradictions only the owner can settle

1. **What does $98 buy?** The website, `index.html`'s structured data and the app's
   `PLAN_VALUE` say $98 a year unlimited. The accounts API's pricing decision of
   2026-07-22 (`src/entitlements.mjs` header, `src/config.mjs`) says unlimited is $98 a
   month, annual is $980 a year, and the $98-a-year Stripe price is "legacy, retired".
   Which Stripe price ids are actually set on the cPanel host is unknown. Issue #12.
2. **Is the accounts API moving to Render?** The migration is fully prepared but not
   started. Until decided, that repo's deploy docs describe a service that does not exist.
   Issue #9.
3. **The stale app at `eb28.co/HIP/app/`** runs old code against live data and is still an
   allowed CORS origin in both APIs. Issue #13.
