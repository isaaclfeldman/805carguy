# 805 Car Guy

Local car-buying service for the Central Coast. One-page site.
Instagram: [@805carguy](https://instagram.com/805carguy) · Domain: www.805carguy.com

## Run locally

```bash
npm install
npm start
# → http://localhost:3000
```

## Deploy to Railway

1. Push this folder to a new GitHub repo (e.g. `isaaclfeldman/805carguy`)
2. Railway → New Project → Deploy from GitHub → pick the repo
3. Railway auto-detects Node and runs `npm start`
4. Grab the Railway-generated domain (something like `805carguy-production.up.railway.app`)

## Point www.805carguy.com at Railway

1. In Railway project → Settings → Networking → **Custom Domain** → add `www.805carguy.com`. Railway shows you the CNAME target.
2. In GoDaddy → DNS management for `805carguy.com`:
   - **CNAME**: host `www` → value `<your-railway-target>.up.railway.app`
   - **Forwarding** on apex `805carguy.com` → forward to `https://www.805carguy.com` (permanent, 301)
3. Wait ~10–30 minutes for DNS + Railway's SSL provisioning. Check with:
   ```bash
   curl -I https://www.805carguy.com
   ```

## Making edits

Everything lives in `index.html`. Change copy, prices, coverage areas, whatever — push to GitHub, Railway auto-deploys in ~60 seconds.

## What's intentionally NOT here

- No database, no auth, no payments integration
- No analytics (add Plausible later if you want)
- No blog, no nav, no about page

Keep it simple. Every visitor has exactly one next step: **DM @805carguy on Instagram.**
