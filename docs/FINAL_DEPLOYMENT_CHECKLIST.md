# AirScope India — Final Deployment Checklist & Runbook

**Production URL:** `https://airscope-india.onrender.com`  
**Hosting Provider:** Render (`render.com`)  
**Deployment Type:** Next.js Web Service or Static Site  

---

## 1. Pre-Deployment Verification Status

- [x] **Local Build Succeeded:** `npm run build` exits with code 0.
- [x] **Route Generation:** 40 static HTML routes generated without errors.
- [x] **Automated Tests:** 16/16 Vitest unit tests pass (`npm test`).
- [x] **PM2.5 Verified:** Tested with live `data.gov.in` feed (3,997 records, 59/59 Delhi stations have PM2.5).
- [x] **Canonical URLs:** Configured to `https://airscope-india.onrender.com`.
- [x] **Sitemap:** Verified at `/sitemap.xml` with 35 crawlable URLs.
- [x] **Robots.txt:** Verified at `/robots.txt` allowing indexing.
- [x] **Bundle Size:** Homepage First Load JS reduced from 461 kB to 123 kB.
- [x] **Git Exclusions:** `.env.local` and `.env` verified in `.gitignore`.

---

## 2. Render Environment Variables Configuration

Ensure the following environment variables are set in the **Render Dashboard** under **Environment**:

| Variable Name | Required? | Recommended Production Value | Description |
| :--- | :--- | :--- | :--- |
| `DATA_GOV_IN_API_KEY` | **YES** | `[Your OGD API Key]` | Required for the CPCB server-side route handler to retrieve live government data. |
| `NEXT_PUBLIC_SITE_URL` | **YES** | `https://airscope-india.onrender.com` | Base URL used for canonical meta tags, Open Graph, and sitemap generation. |
| `NODE_ENV` | **YES** | `production` | Enables production optimizations in Next.js. |
| `STATIC_EXPORT` | Optional | `false` (default) | Keep `false` if deploying as a Render Web Service (Node.js runtime). Set `true` only if deploying as a pure Render Static Site. |
| `NEXT_PUBLIC_ENABLE_ADS` | Optional | `false` | Set `true` only after Google AdSense approval. |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID`| Optional | `ca-pub-XXXXXXXXXXXXXXXX` | Your AdSense publisher ID. |
| `OPENAQ_API_KEY` | Optional | `[OpenAQ Key]` | Secondary fallback provider if CPCB API is temporarily unreachable. |

---

## 3. Step-by-Step Deployment Runbook

### Step 1: Review Git Status
Run:
```bash
git status
```
Verify that `.env.local` is **NOT** staged or tracked.

### Step 2: Commit All Verified Changes
```bash
git add .
git commit -m "feat(seo): complete final production release audit, pm2.5 pipeline, and performance optimization"
```

### Step 3: Push to Production Branch
```bash
git push origin main
```
*(or your configured production branch, e.g., `git push origin master`)*

### Step 4: Monitor Render Build Logs
1. Navigate to the Render Dashboard (`dashboard.render.com`).
2. Open the `airscope-india` service.
3. Observe the build process:
   - Dependency installation (`npm install`)
   - Production compilation (`next build`)
   - Service startup (`next start`)

### Step 5: Post-Deployment Smoke Test
Once the Render deployment status shows **Live**:
1. Check Homepage:
   ```bash
   curl -I https://airscope-india.onrender.com
   ```
   *Expected: HTTP 200 OK*
2. Check API endpoint:
   ```bash
   curl https://airscope-india.onrender.com/api/aqi
   ```
   *Expected: JSON with `success: true` and active stations array*
3. Check Sitemap:
   ```bash
   curl -I https://airscope-india.onrender.com/sitemap.xml
   ```
   *Expected: HTTP 200 OK with XML content*
4. Check Locality page:
   ```bash
   curl -I https://airscope-india.onrender.com/delhi/anand-vihar
   ```
   *Expected: HTTP 200 OK*

---

## 4. Post-Launch Search Engine Actions

1. **Google Search Console Verification:**
   - Add property `https://airscope-india.onrender.com` in Google Search Console.
   - Verify ownership via DNS TXT record or HTML tag.
2. **Submit Sitemap:**
   - Submit `https://airscope-india.onrender.com/sitemap.xml` in Search Console under Sitemaps.
3. **URL Inspection & Priority Indexing Request:**
   - Request indexing for high-priority pages:
     - `https://airscope-india.onrender.com` (Homepage)
     - `https://airscope-india.onrender.com/delhi`
     - `https://airscope-india.onrender.com/delhi/anand-vihar`
     - `https://airscope-india.onrender.com/learn/what-is-aqi`
