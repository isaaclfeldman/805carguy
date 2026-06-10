# 805 Car Guy — Project Reference

Local car-buying service on the Central Coast (San Luis Obispo County). Single-page static site. Customers contact via Instagram DM (@805carguy). No database, no auth, no payments integration — every CTA points to `https://ig.me/m/805carguy`.

## Services & Pricing
- **The Look — $99.** In-person walkaround + test drive, photo/video report, buy-or-walk verdict. Optional mechanical inspection on a lift at the shop: +$100.
- **The Deal — $349 (featured / most requested).** Meet at the dealership, live negotiation on price/financing/add-ons until signed or walk.
- **The Works — $999.** End-to-end: source, vet, inspect, negotiate, close. Savings guarantee (refund the difference if savings < fee; conditions in terms.html §6).
- **Free Deal Review.** Send an out-the-door quote, get a free read. Lead magnet.
- **Service Coordination.** Post-purchase advocacy (quotes, warranty, shops). Hourly or retainer.

Pricing is market-anchored (June 2026): CarEdge/Delivrd/Negotiated charge ~$999–$1,000 for full concierge; remote-only negotiation runs $750+; Lemon Squad PPI ~$120. Tier names changed Apr→Jun 2026: Drive-By/Ride-Along/Full Fetch → On-Site/Mechanical/Negotiation/Concierge → Look/Deal/Works.

Covers: new or used cars (NOT used-only — copy is intentionally generic).

## Architecture
- `index.html` — single file, inline CSS + minimal JS. All copy, styles, structure live here.
- `server.js` — 18-line Express static server. Serves `index.html` for any route. No API, no DB.
- `package.json` — one dep: `express ^4.19.2`. `npm start` → `node server.js`.
- `.gitignore` — `node_modules/`, `.env`, `.DS_Store`, `*.log`.
- Mobile breakpoint: `@media(max-width:760px)`.

## Design DNA
Borrowed from VINhound but warmer/more local. Cream + terracotta palette:
- `--cream-50: #fbf7ef` (primary bg)
- `--cream-100: #f6efdf`, `--cream-200: #ecdfc2`
- `--sand-300: #d6c7a8`, `--sand-500: #8b7a5f`, `--sand-700: #5a4a34`
- `--rust: #b85c3a` (accent — headlines, CTAs, featured card)
- `--rust-dk: #8f4025` (hover)
- Hero `.accent` span uses rust color on the hook phrase
- Featured service card (Ride-Along) has `.featured` class with rust border + badge

## Deployment
- **GitHub:** `https://github.com/isaaclfeldman/805carguy` — branch `main` is the auto-deploy target.
- **Railway:** auto-deploys on push to `main` (~60 sec). Project has service `805carguy-production.up.railway.app`.
  - Railway settings: `https://railway.com/project/3a9d82d5-074c-41c5-adfc-2c12ade150c2/service/62ccfba3-40a5-42f4-9639-00f12b5efa37/settings`
  - Railway CNAME target: `1b6krfo4.up.railway.app` (for www custom domain)
- **Domain:** `www.805carguy.com` → Railway (CNAME). Apex `805carguy.com` → GoDaddy 301 forward → `https://www.805carguy.com`.
  - GoDaddy DNS: `https://dcc.godaddy.com/control/dnsmanagement?domainName=805carguy.com`
  - Railway free plan: 1 custom domain limit, which is why apex is handled via GoDaddy forwarding instead of a second Railway custom domain.

## Dev Flow
Local:
```bash
npm install
npm start
# → http://localhost:3000
```

Deploy = push to main:
```bash
git add . && git commit -m "..." && git push
```

Railway auto-deploys. Verify:
```bash
curl -I https://www.805carguy.com
```

## Instagram Integration
All CTAs deep-link to Instagram DM: `https://ig.me/m/805carguy`. Profile link: `https://instagram.com/805carguy`. There is no contact form, no email capture, no phone number on the site by design — every visitor has exactly one next action: DM.

## What's Intentionally NOT Here
- No database, no auth, no payments integration
- No analytics (Plausible is an option for later)
- No blog, no nav bar, no about page, no FAQ
- No contact form — everything routes to Instagram

Keep it simple. Every feature addition should pass the "does this make it harder for someone with ADHD to take the next step?" test.

## Coverage Area
SLO, Paso Robles, Atascadero, Santa Maria, Arroyo Grande, Pismo Beach, Morro Bay, Nipomo, Templeton, Los Osos.
