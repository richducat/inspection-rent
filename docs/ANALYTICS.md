# Analytics

What is measured, how, and what is still unverified. Inspection data never reaches
analytics; only page views, clicks, and funnel events.

## Identifiers

| Id | What | Where |
|---|---|---|
| `GTM-PX3ZXWR6` | Google Tag Manager container loaded on all 23 marketing pages and in the app shell | Inline loader in each page head; `home-inspection-assistant/index.html` |
| `G-36J97SMTD7` | The GA4 property (measurement id) the container feeds | `assets/marketing-analytics.js` uses it as `send_to` for the same-tab click route |

## The head of every marketing page

1. `<meta charset="utf-8">` first (moved ahead of the scripts on 2026-09-19 so the
   declaration sits inside the first 1024 bytes).
2. **Internal-traffic flag.** Runs before GTM so the container sees it at load. Marks the
   visit `traffic_type: internal` when `navigator.webdriver` is true, when the user agent
   matches automation or AI-agent patterns (HeadlessChrome, Claude, Puppeteer, Playwright,
   Lighthouse, crawler, bot...), or when the browser carries the `ig.internalTraffic`
   localStorage key. `?internal=1` sets the key, `?internal=0` clears it. GA4 must have the
   matching internal-traffic filter active for this to exclude anything; that account-side
   setting has not been confirmed (see below).
3. **GTM loader with hostname guard.** Returns unless the hostname is exactly
   `inspection.rent` or `www.inspection.rent`, so localhost, previews, private IPs, and
   lookalike domains never load the production container. Added by PR #3 (23 pages, one
   of them the built app shell `app/index.html`) and extended to the 4-point page and the
   app source on 2026-09-19. **Not live until PR #3 or the 2026-09-19 PR merges**; until
   then localhost and preview visits still reach GA4. Side effect to remember: on a non-production host the loader
   returns before creating `window.dataLayer`, so inline snippets must initialise it
   themselves (`window.dataLayer = window.dataLayer || [];`) or they throw only off-production.
4. `<noscript>` GTM iframe right after `<body>`.

## Events

**Marketing pages** (`assets/marketing-analytics.js`, loaded on all 23 analytics pages;
12 of them have no link into the app, which is harmless):

- `app_open_click` with a static `cta_location` label, once per click on any link into
  `/app/`. New-tab or modified clicks push the GTM custom event and let the browser
  navigate. Ordinary same-tab clicks call `gtag('event', ...)` with `send_to: G-36J97SMTD7`
  and an `event_callback`, and navigate when the callback fires or after 300 ms, whichever
  comes first (the GTM route also carries `source_page`, the pathname). No query strings and no property details in the payload (the `?v=lpNN`
  on campaign CTAs stays on the link and is used by the app, never sent as an event
  field); never blocks navigation. `tests/marketing-analytics.test.cjs` pins all of this.

**`check.html`** (free property check): `check_search`, `check_found`, `check_failed`,
`generate_lead`. **`how-it-works.html`** also pushes `generate_lead` (with the nearest
heading as `lead_source`) when a trial `mailto:` link is clicked.

**Campaign pages `lp/lp01` to `lp10`** (inline snippets, see `CAMPAIGNS.md`): `lp_view` on
load and `lp_cta_click` on the call to action, both with `lp: "lpNN"`; `lp08` also pushes
`lp_lead_submit` from its lead form. The home page pushes `hero_check_search` and `lp_lead`;
`check.html` pushes `lp_lead` too. Leads themselves go to `accounts.eb28.co/leads`.

**The app** (`home-inspection-assistant/src/domain/analytics.ts`, pushed to `dataLayer`):

- `sign_up` (method `free_signup` today; older values kept for old dashboards)
- `begin_checkout` with `items[0].item_id` = the plan key passed (`payg`, `single`,
  `monthly`, `annual` or `trial`)
- `checkout_return` with `plan` = the server plan id (`payg` | `monthly` | `annual` |
  `unlimited` | `trial`) after home-inspection-assistant PR #5; before it, single-report
  returns were mislabelled `monthly`
- `checkout_error` with `step` and HTTP `status`
- `trial_start`
- **No `purchase` event by design.** A billing return is not a verified payment; revenue
  needs server-side Stripe receipt validation, which does not exist yet.

For any of these to appear in GA4 reports, the GTM container needs a Custom Event trigger
and a GA4 event tag per event name. The public container source confirmed `app_open_click`
is wired (PR #4). Whether the container has tags for `sign_up`, `begin_checkout`,
`checkout_return`, `checkout_error`, and `trial_start` has not been confirmed from the
container itself; `analytics.ts` only documents the requirement.

## Verified and unverified

| Claim | Status |
|---|---|
| Container loads once on the two production hosts and never elsewhere | Verified in a sandbox across 161 scenarios (PR #3) and again on 2026-09-19 for all 24 loaders |
| Internal-traffic flag runs before GTM on all 23 marketing pages (the app shell has no flag) | Verified 2026-09-19 |
| `app_open_click` reaches GA4 from an ordinary same-tab click in production | **Unverified.** PR #6 saw the collection request locally; nobody has checked GA4 Realtime on the live site |
| GA4 internal-traffic filter is active so `?internal=1` visits are excluded | **Unverified** (needs the owner's GA4 admin) |
| Data collected before the guard is live includes localhost hits | Known: 9 pageviews and 30 events in the 30 days before 2026-09-08, and the guard is not live until the PR merges |
