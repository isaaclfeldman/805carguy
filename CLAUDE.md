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

## November 5 (evening) — easy contact, lead-delivery backup, local SEO pages

Isaac asked to make contacting him really easy without publishing personal information, after reporting that the “Email Isaac” mailto link did nothing on his device. Changes in this release:

- Email is shown as the address itself with a Copy button (homepage, About, Contact, inside the intake dialog), so it works on devices without a mail app. `contact.js` handles any `[data-copy]` control. No phone number is published; Call/Text buttons wait on a non-personal number (Google Voice is the proposal).
- New pages: `/contact`, `/faq` (FAQPage schema, local-intent questions in Isaac’s voice) and `/service-area` (SLO city vs. SLO County vs. Santa Maria by quote; OttO beyond). All three are in the sitemap, footer links and the attribution allowlists.
- Homepage: local-intent title/description, `AutomotiveBusiness` schema (SLO address locality only, areaServed cities, four offers), Open Graph image `assets/og-805carguy-v1.png` (1200×630), tagline “Your car guy in San Luis Obispo and across the Central Coast”, responsive portrait variants `assets/isaac-v2-{120,480,720}` (the full-size portrait was the largest mobile download).
- Lead delivery: FormSubmit returned HTTP 522 from about 23:40 UTC on 2026-11-05 and was still down 45 minutes later, which made the live form fail. The browser now falls back to `POST /inquiry` on the site’s own server, which retries FormSubmit server-side and then Resend when `RESEND_API_KEY` (optional `INQUIRY_TO`, `INQUIRY_FROM`) is set in Railway. If every channel fails, the inquiry is written to the deployment log (`inquiry-undelivered`) so the lead survives, and the dialog offers “Email this inquiry instead” (prefilled mailto) and “Copy inquiry details”. `/privacy` describes this. Only form fields are relayed; origin check, honeypot and a 12/hour per-IP limit apply.
- 404 page now carries the site header, footer and links.
- All prices and service scopes are unchanged. Tests: `npm test` covers the relay (`scripts/test-inquiry-relay.js`).

## November 6 — business phone number live

Isaac set up a Google Voice number for 805CarGuy: **(424) 235-4525**, on his personal Google account. Google had no 805 numbers in inventory, so a West LA number was chosen; calls forward to his cell and nothing personal is published. The old dormant (510) 859-3806 line was deleted (reclaimable for 90 days). Call and Text links (`tel:+14242354525`, `sms:+14242354525`) appear in the homepage and About direct-contact lines, in a "Call or text" card on `/contact` with a Copy button, in the FAQ "quick question" answer, in the inquiry dialog's fallback line, and as `telephone` in the AutomotiveBusiness schema. The About timeline was corrected the same evening: the family moved to San Luis Obispo in 2014 and Isaac bought Certified Auto Repair in 2015.

Later the same evening the public email on every page switched to **isaac@805carguy.com** (ImprovMX forwards it to isaac@carofslo.com; a test sent during setup arrived in Gmail). The private delivery address in `server.js`, the FormSubmit alias and the relay are unchanged, and the relay test still asserts the private recipient.

## November 19 — number off the page, sticky Text Isaac button

Isaac asked to take his phone number off the site ("I just want my phone number off there... I like the text one") and approved a Text Isaac button that opens a text to the Google Voice line. The number is no longer printed anywhere: Home/About direct-contact lines now read "Text Isaac", the `/contact` card is "Text Isaac" with one button (Call button and Copy number removed), the FAQ answer points to the Text Isaac button, the inquiry dialog's fallback is a "Text Isaac" `sms:` link, and the contact meta description and the `telephone` field in the AutomotiveBusiness schema were removed so search results don't show it. A sticky navy/gold "Text Isaac" pill (`.text-isaac-fab`, `sms:+14242354525`) sits bottom-right on every public page and the 404 page. The number exists only inside the `sms:` links. No prices or service terms changed.

## November 19 — services page rewritten for the dealership-dreading shopper — LOCAL ONLY

Isaac reviewed `/services` "as an average car shopper that dreads going to dealerships", agreed with the critique and said to build. Branch `services-shopper-rewrite` (based on published `50befa2`) is **not authorized for publication** until he says so.

Only `services.html` and an appended block in `styles.css` changed. The page now opens with Isaac's portrait, the headline "Dread the dealership? I don’t." and three assurances already stated elsewhere on the site (price agreed before work, no dealer pays him, asking books nothing). A "Where are you right now?" chooser of four cards replaces the jump links, followed by three "What happens when you reach out" steps with no response-time promise. Section order is now $249 check, $1,000 complete help, new car, selling. Scope notes (separate-quote area, $199 shop price, prior-payment credit, other-shop cost, seller access) moved into a "The details" disclosure inside each card; none were removed. Buttons read "Send me the car you found" and "Tell me what you’re looking for". The chooser links to the published free intro call on `/pricing#phone-consultation` instead of restating it.

All prices, scopes, payment timing and inquiry entry points are unchanged. The chooser container is a `div`, not a `nav`, because the site-wide mobile rule `nav>a:not(.button){display:none}` hides links inside any `nav`.

## November 19 (later) — "since the nineties", About page rework, OttO taken off the site

Isaac reviewed the About page as a first-time shopper and approved these changes; they are committed on `services-shopper-rewrite` and are **local only until he asks to publish**.

- Experience wording: the short claims read "since the nineties" on Home, About, used-car and new-car pages. The About story keeps the specifics (assistant driving instructor in 1995, auto retail from 2000).
- About: the "you hire me, I work for you, no dealer pays me" promise and an "Ask about a free intro call" button (`/#inquire-intro-call` since the later Nov 19 change below) are in the hero; the closing block is one button plus Text Isaac and email. The OttO aside, the four-link "Start with the decision in front of you" section and the duplicate "in the car business" chip were removed. The shop section says "My shop, Certified Auto Repair" instead of repeating an ownership claim.
- Home: "Free intro call" link beside the pricing link, and the bio adds the work-for-you line and "The first call is free." The free intro call and the optional $50 30-minute phone consultation are the existing `/pricing#phone-consultation` offer; no new price was created.
- **OttO is not mentioned anywhere on the site.** Isaac: it is "not functional enough to talk about it like that." Every yourotto.com link and OttO sentence was removed from the pages, metadata and schema. In `intake.js` the remote entries no longer link out: legacy remote deep links and the two remaining remote options show "Remote help is in development." with an "Ask me anyway" button into the ordinary inquiry, and "No, the car is elsewhere" goes straight to an inquiry. Do not re-add OttO links until Isaac says it is ready. This supersedes the "both sites cross-link" line at the top of this file.
- No prices or service terms changed. Reviews, client stories and shop photos were suggested but need real material from Isaac; none were invented.

## November 19 — services page published

Isaac answered “Yes, publish” when asked whether to publish the new services page to 805carguy.com. It went live through pull request #2 (merge `79b2e4b` on main, Railway auto-deploy), which also carried the two later commits described above (“since the nineties”, About rework, OttO removed). The live `/services` page was checked afterward without sending an inquiry. The “local only” wording in the two sections above is historical. No prices, scopes or account settings changed.

## November 19 (evening) — free intro call first, start-from-zero new-car copy, shorter inquiry — LOCAL ONLY

Isaac asked for a review of the live site as a car-clueless SLO shopper who wants a new car and dreads dealerships, approved the resulting change list (“I like all your suggestions, let’s start”) and said to build. The work is on `services-shopper-rewrite` and is **not authorized for publication** until he says so.

- Home hero: the intro is “I’m Isaac, your car guy in San Luis Obispo. You hire me, so I work for you and nobody else. No dealer pays me anything.” Under “Not sure where to start?” the primary button is “Start with a free intro call” (`data-start="introCall"`); Buy, Sell and “Just a question” sit beneath it. The “Buying new?” card and a “Not sure which?” line speak to someone starting from zero.
- `/new-car-buying-help` leads with “Buying a new car and not sure where to start?” and a three-step “How it works”; the quote and financing guidance is kept lower down. Step one is labelled the free intro call, and the page restates the published $50 30-minute consultation so the free call is not read as covering the paid guidance.
- `intake.js`: conversation entries (general inquiry, the new `introCall` package and `#inquire-intro-call` link, new car, open to either, question) open straight on the contact form with timing as an optional folded field. There is no “Scope and fee agreed first” price card or separate timing screen on those paths. Their review screen shows “Asking for” and one “Cost” row instead of the contract-style rows. Priced services are unchanged. The stored intent for “Just a question” is still `Research`, because `inquiry-delivery.js` only passes known intent values.
- The disclosure is worded “we agree on what I’ll do, what it costs and when you pay before I start” on these surfaces. It carries the same three terms as “scope, fee and payment timing”, which `/pricing`, `/services` and `/terms` still use.
- All prices, scopes and payment terms are unchanged. The free intro call and optional $50 consultation are the existing `/pricing#phone-consultation` offer.

**Open decisions for Isaac, not written into the site:**

- What he does for a new-car buyer beyond advice. The copy stays inside the October 15 scope (choosing and comparing models, understanding dealer quotes, next steps). Whether he contacts dealers, negotiates or attends a signing for a new car, and whether there is a fixed fee, is undecided; do not add either without his answer.
- Proof. The site has no reviews, client quotes, shop address or photos of him at the shop. These need real material from him; none were invented. `805carguy-master.md` records “no personal phone number or address published”, so the shop’s street address was not added without asking.

