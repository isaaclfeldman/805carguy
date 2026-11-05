# 805CarGuy project reference

805CarGuy is Isaac Feldman's local hands-on car-services site, based in San Luis Obispo. OttO provides nationwide remote guidance and search from the 805CarGuy team. Both sites cross-link; they do not duplicate the full catalog. VINhound remains unchanged and separate.

## Current release direction

Finish the websites and collect inquiries. Business/entity setup, payment accounts and naming remain deferred. This preference is not a legal determination. Do not create payment accounts or add checkout. No invented savings, testimonials, demand, or expiration claims.

## Approved pricing and positioning — October 9, 2026

Isaac authorized these changes and publication on both existing sites. The older September consultation/review/purchase menu below is superseded by this split:

- October 12 update (explicit publication approval): 805CarGuy local assessment is **$249 total for one car in SLO city, payment due when booking**. Includes dealership pickup, test drive, transport to Certified Auto Repair, a full used-car inspection and written deal analysis. Ordinary SLO-city pickup/transport is included, not an extra travel charge. Elsewhere in SLO County or beyond requires a separate quote. Confirm seller permission, access and scheduling. This update changes only 805CarGuy; do not edit OttO or expand other packages.
- 805CarGuy complete local used-car purchase: $1,000, $500 to start/$500 upon purchase, including one full inspection at Certified Auto Repair in SLO. Search is an agreed 30 days with at least three qualifying, seller-confirmed cars unless chosen sooner, available-record review and recommendation. Existing extension/refund terms apply. Transport is excluded; extra inspections require approval. Failed inspection alone does not trigger final payment.
- Assisted sell: unchanged $350 upfront, one car/30 days; owner handles showings/negotiation/closing.
- Full-service sell: unchanged 5%, $1,000 minimum, one car/60 days; $350 upfront counts toward total. Owner keeps custody unless arranged otherwise.
- OttO remote services: free 30-minute consultation labeled an introductory offer, $99 written second opinion for up to three cars, $500 standalone 30-day search. The search retains at least three qualifying seller-confirmed candidates unless chosen sooner and existing extension/refund terms. These are OttO services, not duplicate local offers.
- The former $750 purchase-assistance tier is retired. The $249 assessment is now explicitly approved as scoped above. No introductory expiry or future price is invented.

Historical note: September's $49 45–60-minute consultation and $99 single-listing review are superseded by the user-approved OttO offer above. The $1,000 local package and selling prices/scopes are preserved.

Prior payments count once toward an applicable larger service for the same purchase/sale. Example: $500 already paid for search leaves $500 toward the $1,000 complete local service. Repairs, detailing, smog, paid ads and transport outside the $249 assessment's included scope require separate agreement. The $1,000 complete package's existing transport exclusion remains unchanged. Do not silently change these promises.

The site states that a written agreement before work begins confirms the transaction, included candidates/offers/deal revisions, overall timeframe, outside costs, cancellation/refund terms, credits, and when each payment is due. Detailed cancellation and purchase-milestone policies remain open operating decisions; do not invent them or imply `/terms` replaces a client contract. Preserve the existing 30-day search/assisted-sale and 60-day full-sale scopes.

The $199 price is Certified Auto Repair’s standalone full used-car inspection retail price, supplied by Isaac. It is not Isaac's external cost or an 805CarGuy fee, and is not added to either the $249 assessment or the $1,000 complete local package; each already includes one full inspection. Selling examples explain that the $1,000 minimum applies to both $10,000 and $20,000 sales; a $30,000 sale costs $1,500. The $350 assisted option may fit lower-value vehicles when the owner can handle showings, negotiation, and closing.

## Structure and delivery

Node/Express, no build step. `index.html` + `styles.css` + `intake.js` + `inquiry-delivery.js`, portrait at `assets/isaac.jpg`. `server.js` allows only public assets; unknown/private paths return 404. Legacy finder URLs redirect to `/#inquire`. Read README for tests and preview restrictions.

FormSubmit endpoint: `https://formsubmit.co/ajax/3bee3a7c1f40b430ff307881c018db32`, intended recipient `isaac@carofslo.com`. Existing production test messages received September 24 were read in Gmail during September 27 continuation. That establishes historical delivery only. The October 9 content release expressly authorizes no new inquiry send; use no-send review and mocked delivery checks.

GitHub: `https://github.com/isaaclfeldman/805carguy`. Main auto-deploys to Railway. Custom domain `www.805carguy.com`; apex forwarding needs live verification. Review and test the exact scoped release before publication; October 9 user approval already authorizes publishing these content/pricing changes. Do not activate paid agent execution or inventory, renew budgets, change credentials, or buy services.

## October 15 personal redesign preview

Isaac approved a simpler, friendly personal 805CarGuy site: “Buying or selling a car? I can help.” with Buy new / Buy used / Sell paths and his existing portrait. OttO remains the supporting nationwide remote guidance/search destination. New-car help covers choosing/comparing models, understanding dealer quotes and discussing next steps; agree on scope, fee and payment timing before work. No new fixed-price new-car package or new broker, financing, sourcing or delivery promise is authorized. Preserve the established used-car/selling offers and terms.

The approved modern-plate logo-only snapshot was published as `6dd0860`. The broader personal homepage, imagery and inquiry changes on `codex/805-personal-preview` are LOCAL PREVIEW ONLY pending separate publication approval. No inquiry sends or payments are authorized.


## November 4 review candidate

User explicitly retained $249 used-car inspection and $350 assisted sale, with other prices/scopes unchanged, and requested the modern license-plate mobile bookmark icon. The audit changes are prepared on an isolated branch based on published `0fa0633`. Contact-first direct inquiries, pricing comparison, OttO explanation, action spacing/icons, responsive assets and cache headers are local only. Do not treat older publication approvals as approval for this candidate. No push, merge, deployment, third-party account mutation or real inquiry send is authorized in this task.


## November 5 publication authorization

Isaac explicitly requested “publish please” after being asked whether to publish the prepared changes to 805carguy.com. This supersedes the November 4 candidate-only restriction for this exact reviewed implementation. Publish through the existing GitHub main → Railway workflow; preserve all prices and service scope. Verify live pages, inquiry review and bookmark assets without sending an inquiry. No unrelated service/account changes are authorized.


## November 5 follow-up polish — local review only

The audit release `36f24a9` is already published. Isaac requested further polishing; this follow-up on `codex/polish-20261105` is **not authorized for publication** until he asks. Do not reuse the earlier publication approval for these new changes.

The pricing overview now links directly to each service inquiry. Name/contact and an optional car question stay visible; optional timing/location/referral fields are in a native disclosure, reopening when a saved draft contains those values. Existing email/Instagram contact links are available before review, with email also shown on Home/About. Remaining intake arrows use decorative CSS strokes. All prices, service scope, delivery destination, review/Send separation and in-memory-only contact handling remain unchanged.

No sample report, testimonials, response-time commitment, phone number, real inquiry delivery test or upstream account change was invented or performed. Those items require actual material, business decisions or specific authorization. Review evidence is in the task's `outputs/polish-20261105/` directory.

## November 5 follow-up publication authorization

Isaac answered “yes” when asked whether to publish the tested shorter inquiry form, direct pricing-card buttons, earlier contact options and cleaner arrows. This supersedes the follow-up local-only restriction for this exact reviewed candidate. Publish through the existing GitHub main → Railway workflow and verify the live site without sending an inquiry. The $249 assessment, $350 assisted sale and all other prices and service terms remain unchanged. No unrelated account or domain changes are authorized.
