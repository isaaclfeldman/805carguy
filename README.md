# 805CarGuy

Isaac Feldman's personal car-advice and service inquiry website. VINhound stays a separate self-service search tool.

## Run and check

Use Node 18 or newer. Install dependencies with `npm install`, run `npm start`, and open localhost:3000. `npm test` checks inquiry payloads, rejected/unknown delivery responses, timeout behavior, source attribution and public routing. Tests use fake provider responses and local HTTP; they send no email.

Public pages: `/`, `/services`, `/new-car-buying-help`, `/used-car-evaluation`, `/about`, `/terms` (service information), `/privacy`. The new-car page explains dealer-offer comparisons and existing purchase/review scopes; the used-car page describes one complete quoted local car-and-deal assessment. `/robots.txt` advertises `/sitemap.xml` on the production domains. HTML aliases and trailing-slash page aliases redirect permanently to their canonical route. Both `/find-my-car` and `/find-my-car.html` redirect to `/#inquire`. The server only serves explicitly listed public files. Add a new asset to `server.js` when needed.

SEO: Keep the service guide, homepage and intake scopes/prices consistent when editing offers. Titles, descriptions, canonical URLs and structured data are in the HTML. The sitemap lists only real public pages, with no invented modification timestamps. Hosts other than `805carguy.com` and `www.805carguy.com` receive `X-Robots-Tag: noindex, nofollow` and a disallowing robots file, including localhost and Railway previews. When adding a production hostname, update that explicit host list. Search Console ownership and Google Business Profile setup are separate account work; deploying these files does not submit the sitemap or guarantee indexing/ranking.

The approved plate artwork is preserved in `brand-sunset-plate.png`. Pages use its 240/480/720px PNG derivatives in `assets/` for normal/high-density displays, with separate 96px favicon and 180px touch icon. Keep the intrinsic 2:1 logo ratio and existing CSS display sizes. Do not point displayed logos or icons back to the full-size source image.

The service guide and topic pages link directly to the corresponding homepage inquiry step using the `#inquire-*` entries in `intake.js`. General evaluation entry asks about a local assessment, used-car listing or written new-car offer. Dedicated new-car, remote-review and local-assessment links enter the matching scope directly; complete-purchase entry still confirms shop eligibility. Keep these links aligned when changing intake routes. The $99 review covers one used-car listing or written new-car offer. The local car-and-deal assessment has one agreed quote and does not require buying a remote review first. Existing prices remain underneath the three customer choices.

## Inquiry behavior

The public HTML pages, `styles.css`, `intake.js`, `inquiry-attribution.js`, `inquiry-delivery.js`, routing and sitemap changes must deploy together. On the homepage, load `inquiry-attribution.js` before the delivery and intake scripts. The three starting choices are **Check a car or deal**, **Help me buy** and **Help me sell**. The buying branch includes choosing a model, new-car purchase help and used-car search/purchase help. A general inquiry is also available. Each route leads to contact details, review, then a separate Send button. Email/text/call preference and optional buyer location, vehicle location and “How did you hear about me?” are included. The browser sends directly to the existing FormSubmit alias; there is no inquiry database or payment integration.

Sending is enabled only on HTTPS `www.805carguy.com` or `805carguy.com`. Local/other-host previews disable sending. The UI requires an HTTP success plus explicit FormSubmit acceptance. Rejected, malformed and timed-out responses retain the draft in page memory and show uncertainty, with email/Instagram alternatives. Acceptance is not an inbox-delivery receipt. Contact details and the inquiry draft are never written to browser storage. Starting a fresh inquiry resets the draft; closing or reloading the page can discard unsent details.

`inquiry-attribution.js` runs on the public pages and stores only a sanitized source record under `805carguy-inquiry-attribution-v1` in browser-managed, per-tab `sessionStorage`. It preserves the first allowed landing-page path and external referring origin, plus recognized `utm_source`/`utm_medium` labels. An allowed `?from=...` marker records the page leading to the inquiry without replacing the original landing page. No full referring URL, search terms, arbitrary query values, contact draft, advertising IDs or browsing-history list are stored. The source record survives navigation and reloads within the tab's session; if storage is blocked, attribution stays in page memory and the inquiry still works. It uses no tracking cookie or third-party analytics service.

The sanitized source fields are included only when an inquiry is sent to FormSubmit. This provides lead attribution, not a count of all visits or reliable proof that an AI answer caused a visit. Keep the capture and allowlists, delivery payload and `/privacy` explanation consistent when changing this behavior.

## Release

Main auto-deploys to Railway. Review the exact release before pushing. Verify the remote branch before a normal fast-forward push; never force-push. After publication, check the actual page/assets, HTTPS domain routing and one clearly labelled inquiry arriving in `isaac@carofslo.com`, including contact preference and selected service. Keep payment, business setup and naming decisions outside this website release.
