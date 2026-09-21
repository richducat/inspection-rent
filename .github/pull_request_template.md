## What changed

## Why

## Verification (tick only what you actually ran in this checkout)

- [ ] `npm test` passes (analytics click-handoff suite)
- [ ] `npm run mobilecheck` prints `0 overflowing` at 320 and 375 px
- [ ] Pricing launch PR only: `npm run launchcheck -- <launch date>` prints `launchcheck: ok` (terms date and sitemap lastmod set)
- [ ] Nothing under `app/` was edited by hand (it is generated; see AGENTS.md rule 1)
- [ ] New or changed pages keep the head order: charset, internal-traffic flag, guarded GTM loader
- [ ] Indexable new pages are in `sitemap.xml`; campaign pages carry `noindex,nofollow`
- [ ] `docs/STATUS.md` updated: what changed, what is verified, what is not

## Still unverified after this PR

## What the owner needs to do after merging
