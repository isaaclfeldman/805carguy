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
