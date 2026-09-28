# 805CarGuy

Isaac Feldman's personal car-advice and service inquiry website. VINhound stays a separate self-service search tool.

## Run and check

Use Node 18 or newer. Install dependencies with `npm install`, run `npm start`, and open localhost:3000. `npm test` checks inquiry payloads, rejected/unknown delivery responses, timeout behavior and public routing. Tests use fake provider responses and local HTTP; they send no email.

Public pages: `/`, `/services`, `/about`, `/terms` (service information), `/privacy`. `/robots.txt` advertises `/sitemap.xml` on the production domains. HTML aliases and trailing-slash page aliases redirect permanently to their canonical route. Both `/find-my-car` and `/find-my-car.html` redirect to `/#inquire`. The server only serves explicitly listed public files. Add a new asset to `server.js` when needed.

SEO: Keep the service guide, homepage and intake scopes/prices consistent when editing offers. Titles, descriptions, canonical URLs and structured data are in the HTML. The sitemap lists only real public pages, with no invented modification timestamps. Hosts other than `805carguy.com` and `www.805carguy.com` receive `X-Robots-Tag: noindex, nofollow` and a disallowing robots file, including localhost and Railway previews. When adding a production hostname, update that explicit host list. Search Console ownership and Google Business Profile setup are separate account work; deploying these files does not submit the sitemap or guarantee indexing/ranking.

## Inquiry behavior

`index.html`, `styles.css`, `intake.js`, `inquiry-delivery.js` and `assets/isaac.jpg` must deploy together. Four service paths and a general inquiry lead to contact details, review, then a separate Send button. Email/text/call preference is included. The browser sends directly to the existing FormSubmit alias; there is no inquiry database or payment integration.

Sending is enabled only on HTTPS `www.805carguy.com` or `805carguy.com`. Local/other-host previews disable sending. The UI requires an HTTP success plus explicit FormSubmit acceptance. Rejected, malformed and timed-out responses retain the draft and show uncertainty, with email/Instagram alternatives. Acceptance is not an inbox-delivery receipt. Closing/reloading the page can discard unsent details; no browser storage is used.

## Release

Main auto-deploys to Railway. Review the exact release before pushing. Verify the remote branch before a normal fast-forward push; never force-push. After publication, check the actual page/assets, HTTPS domain routing and one clearly labelled inquiry arriving in `isaac@carofslo.com`, including contact preference and selected service. Keep payment, business setup and naming decisions outside this website release.
