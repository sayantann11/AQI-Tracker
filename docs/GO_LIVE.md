# Go-live guide (Render Web Service)

## Why the old deploy showed sample data
The site was deployed as a Render **Static Site** (`STATIC_EXPORT=true`). A static site cannot run `/api/aqi`, so the browser got a 404 and fell back to built-in sample data (stamped 10-Nov, labelled "Stale"). The fix is to deploy as a **Web Service** that runs `next start`.

## Steps (about 10 minutes)
1. Get two free keys
   - data.gov.in: log in -> My Account -> generate API key (you already have this).
   - OpenAQ: https://explore.openaq.org/register -> Settings -> API key (free, 60 req/min).
2. Push this repo to GitHub (`git add -A && git commit && git push`).
3. Render dashboard -> **New + -> Blueprint** -> pick the repo. It reads `render.yaml`. (Or New + -> Web Service: build `npm ci && npm run build`, start `npm start`, health check `/api/health`.)
4. In the service's Environment tab set `DATA_GOV_IN_API_KEY` and `OPENAQ_API_KEY`. Do **not** set `STATIC_EXPORT`. Delete `NEXT_PUBLIC_SITE_URL` if it says `airscope-india.onrender.com`.
5. Delete the old Static Site (or point nothing at it) so Google does not see two copies.
6. Open `https://<your-service>.onrender.com/api/status`. You should see `ok: true` for `cpcb` (and `openaq`), `measuredStations` > 0. If `cpcb` shows an error, the message tells you why (bad key, rate limit, upstream down).

## Free-tier behaviour to know
- Render free web services sleep after ~15 min idle; the next visit waits up to ~1 minute. A free uptime pinger (UptimeRobot, 5-min interval on `/api/health`) keeps it warm. Free instances have monthly hour limits; one always-on service fits.
- Data is cached in memory for 10 minutes, so upstream APIs are called at most ~6 times/hour.

## Search Console
1. Add the property for your URL, choose HTML tag, copy the token value into `NEXT_PUBLIC_GSC_VERIFICATION`, redeploy, click Verify.
2. Submit `https://<your-url>/sitemap.xml`.

## Ads
See `docs/MONETIZATION.md` and the notes in the chat hand-off: AdSense generally will not approve an `onrender.com` subdomain. Keep `NEXT_PUBLIC_ENABLE_ADS=false` until approved.

## Production checklist (Render free plan, step by step)

1. **Push** the repo to GitHub (`git push origin main`).
2. **Delete the old Static Site** in Render (Dashboard → the static site → Settings → Delete). It cannot run `/api/*`.
3. **New → Blueprint** → pick this repo. Render reads `render.yaml` and creates the Web Service `aqi-tracker`.
   (Or New → Web Service: Runtime Node, Build `npm ci && npm run build`, Start `npm start`, Health check path `/api/health`, Plan Free.)
4. **Environment** (service → Environment): set `DATA_GOV_IN_API_KEY` and `OPENAQ_API_KEY`.
   Do NOT set `ALLOW_FIXTURES`. Optionally set `NEXT_PUBLIC_SITE_URL` to your real URL.
5. **Verify** after deploy: open `/api/health` (200), `/api/status` (cpcb/openaq `ok: true`, `measuredStations` > 50), then the home page.
6. **Keep it awake (free plan sleeps after 15 min idle):**
   - UptimeRobot (free): HTTP monitor on `https://<your-service>.onrender.com/api/health`, interval 5 min. Primary.
   - GitHub backup: repo → Settings → Secrets and variables → Actions → Variables → add `SITE_URL`. `.github/workflows/keepalive.yml` then pings every 10 min.
   - Free plan gives 750 instance-hours/month, enough for one always-on service (744 h).
7. **Never down on deploy:** `healthCheckPath` makes Render keep the old version serving until the new one is healthy.
8. **If upstream APIs fail:** the server serves the last good cached data and `/api/status` shows which source is down; it never shows sample data.
9. **True zero-cold-start** needs a paid instance (Render Starter, about $7/month). Upgrade when ad revenue covers it.
10. CI (`.github/workflows/ci.yml`) runs type-check, tests and build on every push; Render auto-deploys from `main`.
