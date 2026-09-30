# Patches written on 2026-09-30 but deliberately NOT applied

Both come from the 2026-09-30 error review (see `docs/STATUS.md`, entry of that date).
Each was verified to apply and pass that repository's tests, and each was left out of
its branch on purpose. Nothing here is on any branch; this folder is the only copy.

## `hip-records-api-accela-pagination.patch` (records API, `server.mjs`)

**What it fixes.** On an Accela portal (Brevard County, Palm Bay, Melbourne, Rockledge,
Cape Canaveral ...) a slow "Next >" postback can hand the scraper the same page twice.
The duplicate rows made "rows read ≥ total" come true while "Next >" was still on the
page, the later de-dup quietly dropped them, and the OLDEST pages (the ones that date a
roof) were never read and never flagged as partial. A tenant that prints no
"Showing a-b of N" line ended every read after one page for the same reason.

**Why it is not applied.** The fix changes the page loop of the live Accela adapter, and
the only proof that it reads a real portal end to end is `node scripts/verify-coverage.mjs`
run from a machine with a browser and portal access (the owner's Mac). A simulation of the
page loop passed with and without the patch; the live run has not happened.

**How to apply.** In `hip-records-api`, on top of `claude/permit-matching-fixes`:

```
git apply --index docs/patches/2026-09-30/hip-records-api-accela-pagination.patch
node --check server.mjs && node scripts/test-address.mjs && node scripts/verify-coverage.mjs
```

## `hip-accounts-api-put-versioning.patch` (accounts API)

**What it does.** Gives every saved property a version number and lets `PUT /properties/:id`
refuse a save whose base version is stale with a real `409 version_conflict`, so two devices
editing one inspection no longer silently overwrite each other. The property-count 409
gets its own code (`property_limit`). The patch file starts with a full write-up.

**Why it is not applied.** The app's current conflict handling (in `sessionBackend.ts`)
drops the dirty flag on ANY 409, so with the server patch alone every conflict would make
a device discard its local work instead of overwriting the other device's. Both lose
data; the patch only changes who. The app must change first (four steps listed in the
patch's preamble: react only to `version_conflict`, keep the local copy and the dirty
flag, stamp versions from every PUT and GET including offline replay, persist the base
version). Deploy order: app first, then this server patch.

**How to apply, once the app change has shipped.** In `hip-accounts-api`, on top of
`claude/billing-hardening`:

```
git apply --index docs/patches/2026-09-30/hip-accounts-api-put-versioning.patch
JWT_SECRET=ci-only-secret node --test
```
