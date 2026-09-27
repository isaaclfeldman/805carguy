# 805CarGuy

Isaac Feldman's personal car-advice and service inquiry website. VINhound stays a separate self-service search tool.

## Run and check

Use Node 18 or newer. Install dependencies with `npm install`, run `npm start`, and open localhost:3000. `npm test` checks inquiry payloads, rejected/unknown delivery responses, timeout behavior and public routing. Tests use fake provider responses and local HTTP; they send no email.

Public pages: `/`, `/terms` (service information), `/privacy`. Both `/find-my-car` and `/find-my-car.html` redirect to `/#inquire`. The server only serves explicitly listed public files. Add a new asset to `server.js` when needed.

## Inquiry behavior

`index.html`, `styles.css`, `intake.js`, `inquiry-delivery.js` and `assets/isaac.jpg` must deploy together. Four service paths and a general inquiry lead to contact details, review, then a separate Send button. Email/text/call preference is included. The browser sends directly to the existing FormSubmit alias; there is no inquiry database or payment integration.

Sending is enabled only on HTTPS `www.805carguy.com` or `805carguy.com`. Local/other-host previews disable sending. The UI requires an HTTP success plus explicit FormSubmit acceptance. Rejected, malformed and timed-out responses retain the draft and show uncertainty, with email/Instagram alternatives. Acceptance is not an inbox-delivery receipt. Closing/reloading the page can discard unsent details; no browser storage is used.

## Release

Main auto-deploys to Railway. Review the exact release before pushing. Verify the remote branch before a normal fast-forward push; never force-push. After publication, check the actual page/assets, HTTPS domain routing and one clearly labelled inquiry arriving in `isaac@carofslo.com`, including contact preference and selected service. Keep payment, business setup and naming decisions outside this website release.
