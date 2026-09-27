# 805CarGuy project reference

805CarGuy is Isaac Feldman's personal brand and human-services inquiry site, based in San Luis Obispo. VINhound is a separate self-service car-search tool; do not merge the code or turn VINhound into the human service brand.

## Current release direction

Finish the websites and collect inquiries. Business/entity setup, payment accounts and naming remain deferred. This preference is not a legal determination. Do not create payment accounts or add checkout. No invented savings, testimonials, demand, or expiration claims.

The September 2026 homepage has choose/find, buy, sell, evaluate and general inquiry paths. Current working scopes live in the displayed `intake.js` package descriptions and homepage FAQs:

- Choosing consultation: $49 for the first five clients; 45–60 minutes, three model/year/trim recommendations and one follow-up.
- Used-car search: $500 for an agreed 30-day search; at least three qualifying actual cars unless chosen sooner; seller confirmation and available-record review. Extension/refund if the agreed search cannot be delivered; physical inspection separate.
- Purchase assistance: introductory $750; typical new-car offer comparison included. No approved expiration or claimed regular-price discount.
- Complete local used-car purchase: $1,000, $500 to start/$500 on purchase, including one inspection at Certified Auto Repair in SLO. Seller permission/scheduling needed; transport excluded; extra inspections approved separately. Failed inspection alone does not trigger final payment.
- Evaluate: $99 for one listing/records or written new-car deal, written verdict and one follow-up. Not a physical inspection.
- Assisted sell: $350 upfront, one car/30 days; owner handles showings/negotiation/closing.
- Full-service sell: 5%, $1,000 minimum, one car/60 days; $350 upfront counts toward total. Owner keeps custody unless arranged otherwise.

Prior payments count once toward applicable larger service for the same purchase/sale. Repairs, detailing, smog, paid ads and transport require separate agreement. Detailed cancellation and purchase-milestone terms are open operating decisions; the `/terms` page is service information, not a replacement client contract. The $199 shop inspection price is Isaac-supplied.

## Structure and delivery

Node/Express, no build step. `index.html` + `styles.css` + `intake.js` + `inquiry-delivery.js`, portrait at `assets/isaac.jpg`. `server.js` allows only public assets; unknown/private paths return 404. Legacy finder URLs redirect to `/#inquire`. Read README for tests and preview restrictions.

FormSubmit endpoint: `https://formsubmit.co/ajax/3bee3a7c1f40b430ff307881c018db32`, intended recipient `isaac@carofslo.com`. Existing production test messages received September 24 were read in Gmail during September 27 continuation. That establishes historical delivery only; verify the new release with a real inbox receipt after publishing.

GitHub: `https://github.com/isaaclfeldman/805carguy`. Main auto-deploys to Railway. Custom domain `www.805carguy.com`; apex forwarding needs live verification. Review and approve the exact release before publication.
