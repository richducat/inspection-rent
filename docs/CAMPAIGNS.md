# Campaign landing pages

The ten pages under `lp/` are ad and outreach destinations. They are `noindex,nofollow`,
have no canonical link, are not in `sitemap.xml`, and load shared files with `../assets/`
paths. Each carries an inline snippet that pushes `lp_view` on load and `lp_cta_click` on
the call to action with the campaign id: `lp01` to `lp05` set it once as `var LP = "lpNN"`,
`lp06` to `lp10` repeat `lp:'lpNN'` inside each push. The CTAs link to `/app/?v=lpNN` so
the app can see which campaign sent the visitor (the `v` value is never put into an
analytics event payload). Only `lp01` to `lp05` share `../assets/site.css`; the others
carry their own styles. Add a row here when you add a page; recipe in `RUNBOOK.md` section 4.

| Page | Title (the promise) | Notes |
|---|---|---|
| `lp/lp01.html` | Your First Address Is Free | Rewritten 2026-09-21 for the $50 / $500 offer (was "Start Free, No Card Needed", built on the $5 single report): first address free, see the finished report before you pay |
| `lp/lp02.html` | $500 a Year, Unlimited Inspections | Rewritten 2026-09-21 (was "$98 a Year"): $500 a year unlimited against $900 to $1,800 a year elsewhere. Any ad or email that still quotes $98 or $5 and points here must be paused or updated at launch |
| `lp/lp03.html` | See the Records Pull Work First | |
| `lp/lp04.html` | Wind Mitigation Software — OIR-B1-1802 Pre-Filled | |
| `lp/lp05.html` | Florida 4-Point Inspection Software — Form Pre-Filled | The indexable sibling is `4-point-inspection-software.html` at the root |
| `lp/lp06.html` | What is the paperwork costing you? | |
| `lp/lp07.html` | Built with a working Brevard County inspection firm | |
| `lp/lp08.html` | Looking for a rental inspection? Read this first | Has a lead form (`lp_lead_submit`); leads go to `accounts.eb28.co/leads` |
| `lp/lp09.html` | Inspector Gadgets — pre-filled Florida inspection forms | |
| `lp/lp10.html` | Run a complete inspection before you pay a cent | |

The next page is `lp/lp11.html`. Who runs the campaigns, on which channels, and what each
page's results were is not recorded anywhere; ask the owner before adding more.
