# 805CarGuy

Isaac Feldman's local hands-on car-service inquiry website. OttO provides nationwide remote guidance and search; VINhound remains unchanged.

## Run and check

Use Node 18 or newer. Install dependencies with `npm install`, run `npm start`, and open localhost:3000. `npm test` checks inquiry payloads, rejected/unknown delivery responses, timeout behavior, source attribution and public routing. Tests use fake provider responses and local HTTP; they send no email.

Public pages: `/`, `/services`, `/pricing`, `/new-car-buying-help`, `/used-car-evaluation`, `/about`, `/terms` (service information), `/privacy`. The new-car page retains dealer-offer guidance, opens the same Isaac inquiry with new-car intent, and links to OttO’s remote services; the used-car page describes the $249 total assessment for one car in SLO city, due when booking. `/robots.txt` advertises `/sitemap.xml` on the production domains. HTML aliases and trailing-slash page aliases redirect permanently to their canonical route. Both `/find-my-car` and `/find-my-car.html` redirect to `/#inquire`. The server only serves explicitly listed public files. Add a new asset to `server.js` when needed.

SEO: Keep the service guide, homepage and intake scopes/prices consistent when editing offers. Titles, descriptions, canonical URLs and structured data are in the HTML. The sitemap lists only real public pages, with no invented modification timestamps. Hosts other than `805carguy.com` and `www.805carguy.com` receive `X-Robots-Tag: noindex, nofollow` and a disallowing robots file, including localhost and Railway previews. When adding a production hostname, update that explicit host list. Search Console ownership and Google Business Profile setup are separate account work; deploying these files does not submit the sitemap or guarantee indexing/ranking.

October 15 approved logo release: header and footer home links use the existing, unchanged `brand-modern-plate.png` (1774×887). `.wordmark-modern` frames the full plate rim while hiding empty canvas; the raster itself keeps its 2:1 proportions. CSS multiply blends the white plate into the ivory page. Display windows are 220px on desktop, 145–180px on mobile and 134px in the footer. The November 4 review candidate below replaces the old favicon/touch references and uses optimized derivatives of the same modern artwork. The original source files remain preserved. The approved logo-only snapshot was published in commit `6dd0860` on October 15. The personal homepage redesign described below is a separate local preview and must not be published without its own approval.

The local catalog contains a $249 total assessment for one car in SLO city, payment due when booking. It includes dealership pickup, a test drive, transport to Certified Auto Repair, a full used-car inspection and written deal analysis. Ordinary SLO-city pickup/transport carries no extra travel charge; elsewhere in SLO County or beyond requires a separate quote. The shop's $199 standalone retail inspection is not an extra charge or Isaac's external cost.

The other services remain $1,000 complete local used-car help (including one Certified Auto Repair inspection), $350 assisted selling for one car/30 days, and full-service selling at 5% with a $1,000 minimum for one car/60 days. Complete buying retains its $500 start/$500 purchase milestones and agreed 30-day search with at least three qualifying seller-confirmed cars unless chosen sooner, plus existing extension/refund and credit terms. Transport remains excluded from the $1,000 package; its personal visits/test drives and travel/access are agreed first. Sending an inquiry still does not book work or take payment.

Nationwide remote services belong to OttO. Legacy remote inquiry fragments show an explicit OttO handoff with no automatic redirect or personal-data transfer. The previous $750 tier is retired. Local complete-purchase inquiry still checks shop eligibility; an uncertain location goes to a local arrangements inquiry, not an assumed booking.

## Inquiry behavior

Direct priced-service links preselect the service and show name, contact preference and reply details first. Timing is optional on this form. Complete local buying still asks whether the car can come to the SLO shop before review: Yes retains the complete package, No offers an explicit OttO handoff, and Not sure becomes an unpriced local-arrangements inquiry. The review and payload include the existing answer as `local_shop_arrangements`. This answer stays only in the in-memory draft until Send; no new browser storage is introduced. The undecided Buy/Sell/Research guided path remains available.

The public HTML pages, `styles.css`, `intake.js`, `inquiry-attribution.js`, `inquiry-delivery.js`, routing and sitemap changes must deploy together. On the homepage, load `inquiry-attribution.js` before the delivery and intake scripts. The primary starting choices are **Buy**, **Sell** and **Research**, with a secondary link path for remote help through OttO. Buy asks **New**, **Used** or **Open to Either**. New begins with a scope-and-fee conversation; Used offers the existing $249 assessment or $1,000 complete used-car package, retaining the shop-eligibility question. Open to Either and Research continue as conversations without a fixed-price product or a forced vehicle-type decision. Purchase preference is shown in review and included in the inquiry payload; Back/reselection and reopening must not reuse a stale choice. A general inquiry is also available. Each route leads to contact details, review, then a separate Send button. Email/text/call preference and optional buyer location, vehicle location and “How did you hear about me?” are included. The browser sends directly to the existing FormSubmit alias; there is no inquiry database or payment integration.

Sending is enabled only on HTTPS `www.805carguy.com` or `805carguy.com`. Local/other-host previews disable sending. The UI requires an HTTP success plus explicit FormSubmit acceptance. Rejected, malformed and timed-out responses retain the draft in page memory and show uncertainty, with email/Instagram alternatives. Acceptance is not an inbox-delivery receipt. Contact details and the inquiry draft are never written to browser storage. Starting a fresh inquiry resets the draft; closing or reloading the page can discard unsent details.

`inquiry-attribution.js` runs on the public pages and stores only a sanitized source record under `805carguy-inquiry-attribution-v1` in browser-managed, per-tab `sessionStorage`. It preserves the first allowed landing-page path and external referring origin, plus recognized `utm_source`/`utm_medium` labels. An allowed `?from=...` marker records the page leading to the inquiry without replacing the original landing page. No full referring URL, search terms, arbitrary query values, contact draft, advertising IDs or browsing-history list are stored. The source record survives navigation and reloads within the tab's session; if storage is blocked, attribution stays in page memory and the inquiry still works. It uses no tracking cookie or third-party analytics service.

The sanitized source fields are included only when an inquiry is sent to FormSubmit. This provides lead attribution, not a count of all visits or reliable proof that an AI answer caused a visit. Keep the capture and allowlists, delivery payload and `/privacy` explanation consistent when changing this behavior.

## Release

Main auto-deploys to Railway. Review the exact release before pushing. Verify the remote branch before a normal fast-forward push; never force-push. After publication, check the actual page/assets, HTTPS domain routing and service inquiry review without sending. A new live delivery test requires its own authorization; the current content release does not authorize sending inquiries. Keep payment, business setup and naming decisions outside this website release.

## Personal homepage preview — October 15, 2026

Local-only branch `codex/805-personal-preview` builds on the published logo release. The homepage has four compact sections: personal hero with Buy new / Buy used / Sell, buying options, selling options, and Meet Isaac/contact. Existing detailed used-car, selling and service-information terms are preserved. New-car help starts with choosing/comparing models and dealer quotes; scope, fee and payment timing are agreed before work. No new priced package or outcome promise was added.

The existing real Isaac photograph is unchanged. `assets/gearshift-600.jpg` (60 KB) and `assets/gearshift-1200.jpg` (188 KB) are responsive versions of original AI-generated editorial artwork, not a photograph of inventory or Isaac's car. The generation prompt and source provenance are in `IMAGE-PROVENANCE.md`; only the two JPEGs are publicly allowlisted. The existing modern logo artwork remains intact; the November 4 review candidate aligns bookmark and metadata references with it.

New entry points `#inquire-new-car`, `#inquire-used-car` and `#inquire-sell` share the existing intake. Review and delivery include an explicit intent, even if the visitor leaves the optional message blank. Existing remote inquiry links retain their OttO destinations. Tests cover Back, close/reopen, new route selection, and intent reset; local previews cannot send inquiries.

Do not push or deploy this personal redesign without separate approval.

## October 29 homepage and pricing refinement

Approved navigation labels: Services, Meet Isaac, Let’s Talk. The existing real coastal photograph, logo and headline remain. The supporting tagline appears lower-left, the intro uses the approved car-guy-in-your-corner wording, and the primary prompt is Where should we start? The Pricing page at `/pricing` records the same approved fees, inclusions, payment timing and geographic boundaries as services/terms. Its inquiry links retain source attribution. No new checkout, fee, guarantee or research deliverable was introduced.


## November 4 audit improvements — prepared, not published

Isolated review candidate based on published `0fa0633bd946425a9141682ec4b5fed6acfd81f1`. The current task does **not** authorize push, merge or deployment. Earlier release approvals above are historical.

- All existing prices and service terms remain: $249 assessment, $1,000 complete local purchase, $350 assisted sale, and 5%/$1,000-minimum full sale. Pricing now starts with a compact comparison; OttO is explained as the same team's nationwide remote service with its own options and prices.
- Service-specific inquiry links open contact details immediately with the selected offer. Name, reply preference and email/phone precede optional context. Timing is optional on these direct paths. The complete-buying path still asks SLO-shop eligibility before review; unsure becomes a local-arrangements conversation, and no offers the existing explicit OttO handoff. Guided entry remains for undecided visitors. Review and Send stay separate.
- Modern plate icons are opaque PNGs at 32/96/180/192/512. Every public page links the versioned Apple icon and browser favicon; the manifest uses 192/512 with browser display. `/apple-touch-icon.png` and the legacy `/assets/plate-touch-180.png` / `/assets/plate-icon-96.png` URLs also serve the modern artwork, with revalidation. Existing OS home-screen shortcuts may retain an old cached icon until removed/re-added after publication; no physical-device installation test was performed.
- Responsive WebP hero/logo images have JPEG/PNG fallbacks. The approved artwork/crop/composition is retained. Tall mobile hero `sizes` accounts for the cover crop. Maximum hero and logo derivatives total 124,022 bytes versus 2,884,701 source bytes. Actual selection depends on viewport/device density.
- Versioned image paths use one-year immutable caching. Change the filename version whenever bytes change. HTML, scripts, CSS, manifest and unversioned icon revalidate so a later release can update them. The public-file allowlist remains explicit.
- The apex domain still redirects upstream to `http://www.805carguy.com`; this Express project does not control that forwarding response. No DNS, hosting or redirect-account setting was changed.

Validation evidence belongs to the task's `outputs/` directory. Tests use mocked delivery; browser checks block external requests and all non-GET/HEAD methods. No inquiry or payment was sent.


## November 5 publication authorization

Isaac explicitly requested “publish please” after being asked whether to publish the prepared changes to 805carguy.com. This supersedes the November 4 candidate-only restriction for this exact reviewed implementation. Publish through the existing GitHub main → Railway workflow; preserve all prices and service scope. Verify live pages, inquiry review and bookmark assets without sending an inquiry. No unrelated service/account changes are authorized.


## November 5 follow-up polish — local review only

The audit release `36f24a9` is already published. Isaac requested further polishing; this follow-up on `codex/polish-20261105` is **not authorized for publication** until he asks. Do not reuse the earlier publication approval for these new changes.

The pricing overview now links directly to each service inquiry. Name/contact and an optional car question stay visible; optional timing/location/referral fields are in a native disclosure, reopening when a saved draft contains those values. Existing email/Instagram contact links are available before review, with email also shown on Home/About. Remaining intake arrows use decorative CSS strokes. All prices, service scope, delivery destination, review/Send separation and in-memory-only contact handling remain unchanged.

No sample report, testimonials, response-time commitment, phone number, real inquiry delivery test or upstream account change was invented or performed. Those items require actual material, business decisions or specific authorization. Review evidence is in the task's `outputs/polish-20261105/` directory.

## November 5 follow-up publication authorization

Isaac answered “yes” when asked whether to publish the tested shorter inquiry form, direct pricing-card buttons, earlier contact options and cleaner arrows. This supersedes the follow-up local-only restriction for this exact reviewed candidate. Publish through the existing GitHub main → Railway workflow and verify the live site without sending an inquiry. The $249 assessment, $350 assisted sale and all other prices and service terms remain unchanged. No unrelated account or domain changes are authorized.
