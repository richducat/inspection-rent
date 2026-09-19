# Decisions

Why things are the way they are. Newest first. Each entry names its source so it can be
re-read; a short hash with no repository name is a commit in this repository, and the
app's August history lives here as this repository's deploy commits (the app repository
on GitHub does not contain those hashes). Add an entry whenever a PR changes a rule, a
dependency, or a trade-off. Dates are UTC.

| Date | Decision | Why | Source |
|---|---|---|---|
| 2026-09-19 | A handoff system lives in this repo: `AGENTS.md` (imported by `CLAUDE.md`), `docs/`, a PR template, and `docs/STATUS.md` updated every session | The owner is not a programmer; any engineer or AI must be able to continue without a verbal briefing | this PR |
| 2026-09-19 | `<meta charset>` is the first element in every page head | Codex found on PR #1 that the tracking scripts pushed it past the 1024-byte window; harmless on Pages (header carries the charset) but wrong for any other host | PR #1 review thread, this PR |
| 2026-09-19 | The mobile overflow check is committed (`tests/mobile-overflow-check.cjs`) and runs in desktop emulation with real webfonts | Mobile emulation zooms out and hides overflow; fallback fonts are narrow enough to hide the nav overflow. Both false negatives happened in September | this PR |
| 2026-09-19 | Marketing top bar keeps only the CTA below 520 px; the pricing grid stacks; the home header shrinks below 400 px | Seven pages were wider than a phone (nav row up to 507 px, pricing page 510 px) | commit 245741a (written 2026-09-01, landed in this PR) |
| 2026-09-19 | The hostname guard and the checkout-return plan id are fixed in the app source, not in the published copy | `deploy-hip.sh` rsyncs over `app/` with `--delete`; a patch here dies on the next deploy | home-inspection-assistant PR #5 |
| 2026-09-11 | Same-tab clicks into the app go through `gtag('event')` with a callback and a 300 ms fallback | The GTM custom event was lost when the page unloaded; the GTM callback produced no visible collection request | PR #5, PR #6 |
| 2026-09-11 | One indexable 4-point software page; campaign pages under `lp/` stay `noindex` | Inspector Gadgets had no indexable page for its main search term | PR #4 |
| 2026-09-08 | GTM loads only on `inspection.rent` and `www.inspection.rent` (decided in PR #3; not live until it or the 2026-09-19 PR merges) | GA4 audit found localhost traffic in the production property | PR #3 |
| 2026-09-07 | No `purchase` event; `checkout_return` with the plan only, never the username | A billing return can be a restored subscription; usernames are identifying | PR #2, home-inspection-assistant PR #1 |
| 2026-09-07 | Internal-traffic flag runs before the GTM loader | Otherwise the first tags fire before the visitor is classified | PR #1 |
| 2026-08-18 | Free tier shows an upgrade prompt at address research instead of a hidden error; permit-coverage banner never cries wolf on a failed research pass; the app names why a city cannot auto-pull; city-portal results can be pasted in (the human solves the CAPTCHA) | Honesty about what was and was not searched; a `covered: true, permits: 0` response must never read as "no permit history" | commits 6b6547f, b3dcbca, dfac257, be47e12 |
| 2026-08-15 | Two agreeing sources confirm a fact; a disagreement is flagged before signing | Beth signs the forms; a wrong value costs a re-inspection | commit c1834ad |
| 2026-08-10 | The homepage always shows Log in for existing customers | Existing users could not find sign-in | commit f6a44ba |
| 2026-08-08 / 09 | Internal traffic is excluded via `?internal=1` and an automation user-agent list | The owner's and the assistants' visits were polluting GA4 | commits 97f9f07, 087bc8f |
| 2026-08-06 | Pages deploys through Actions (`pages.yml`), not the legacy Jekyll builder | Two Jekyll builds timed out on 2026-08-06 despite `.nojekyll` | commit d9a6f91 |
| 2026-08-06 | Free signup, no card; pay only to unlock clean reports ($5 a report, $20/mo for 10, $98/yr unlimited) | Conversion: let inspectors run a real job and see the watermarked sample first | commit ff6000c |
| 2026-07-18 | Plan to move the accounts API from the shared cPanel host to Render (not yet done) | A neighbouring app exhausted the host's process limit and took accounts down; records API on Render was unaffected | `hip-accounts-api/render.yaml`, `docs/MIGRATION.md` |
| 2026-07-14 | `inspection.rent` is the only live site; `eb28.co/HIP` retired | "Pointless to keep updating two sites" | `deploy-hip.sh` comment |
| Standing | The app is never deployed to Vercel | Owner's standing instruction | `home-inspection-assistant/CLAUDE.md` |
| Standing | The permit call keeps its 240 s timeout | The records server drives a real browser sequentially; the 50 s default aborted while it was still working and read as flakiness | `home-inspection-assistant/CLAUDE.md` |

## Decisions made in the other repositories that shape this system

| Date | Decision | Why | Source |
|---|---|---|---|
| 2026-09-10 | Both APIs stay on Express 4; `body-parser` and `qs` patched for the query-parser advisories | Zero advisories without an Express 5 migration | hip-accounts-api #1, hip-records-api #1 |
| 2026-08-14 | The inspector profile (licence, signature, logo) gets a server copy; the app posts its own crash reports to `POST /client-errors` | The profile lived only in localStorage and died on sign-out; telemetry was unreadable from a phone | hip-accounts-api commit b94234a and the app |
| 2026-08-14 | Permits are routed by who issues permits at the coordinates (Census incorporated-places lookup), not by the mailing city | Mailing city and permitting authority differ; the wrong office returned zero permits | hip-records-api commit f9e6a21 |
| 2026-08-13 | Only a 401 signs the inspector out; a 5xx or timeout is shown as "an outage on our side" | During the 2026-08-11 host outage the app hung on Loading and a transient 5xx logged users out | app commits 98c502d, 10017b6 |
| 2026-08-06 | Signup is free and card-less: register creates an active `sample` tier with watermarked reports; the card-at-signup wall of 2026-07-21 is reversed | The card wall blocked the funnel | hip-accounts-api commit 0278319 |
| 2026-08-05 | The iOS shell hides every purchase and billing surface; the web app shows "managed on the web" inside it | Apple App Review 2026-08-04, guideline 3.1.1 | app commits a88baa0, 96bbeee |
| 2026-08-05 | Records metering fails closed on any non-402 accounts response; a forged unsigned token can never pull during an outage; CI checks the Dockerfile copy list | A break-it pass found free metered pulls on timeouts and an image that built but died on boot | hip-records-api commits bda5cfb, 6086388, e8ac165 |
| 2026-08-02 | `permitHistoryComplete` is tri-state (true, false, unknown); a search that never reached the issuing office must never look like "no permit history" | The inspector said the puller was broken for three weeks because those two cases rendered identically | hip-records-api commit 5f640a4 |
| 2026-07-29 | Every records deploy bumps the `deploy` marker in `GET /health` | A fix shipped and nobody could tell whether the live build had it | hip-records-api commits 3f4d34a, abf7ab2 |
| 2026-07-22 | Backend pricing: unlimited $98/mo, annual $980/yr, monthly $20 for 10, single $5; the $98/yr price retired as legacy. **The website still sells $98/yr; unresolved** | Pricing decision of that day | hip-accounts-api commits db93cb0, f4e1df1; issue #12 |
| 2026-07-21 | A no-card trial was added and paused the same day | It handed over one signed 4-Point PDF, the exact artifact an inspector sells, repeatable per email | hip-accounts-api commits 2e4dcf3, 41b6eb6 |
| 2026-07-15 | Hourly off-box SQLite backup pulled to the owner's Mac over SSH, 30-day retention, with a health watch and iMessage alerts | The database lived on one host disk and was the only copy | hip-accounts-api commits f77ed96, 5402fcb |
| 2026-07-06 | A real accounts backend (Node, Express, SQLite via `node:sqlite`, bcrypt, JWT, Stripe) replaces the app's client-side login gate; production refuses to boot without a real admin password | The client-side gate was not a real auth or billing boundary | hip-accounts-api commits 9d64804, 35bfff0 |
