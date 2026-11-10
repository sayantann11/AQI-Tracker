# AirScope India — Production Deployment Runbook (Zero-Cost Target)

This guide documents the exact steps to deploy AirScope India to production at **₹0 recurring infrastructure cost** using Render Static Sites and Cloudflare Workers.

---

## 1. Architecture & Infrastructure Cost Profile

| Service | Role | Cost | Free Tier Allocation |
| :--- | :--- | :--- | :--- |
| **Render Static Site** | Serves static HTML/JS/CSS frontend | **₹0.00** | Unlimited bandwidth, automatic SSL, custom domain support |
| **Cloudflare Workers** | Edge API Proxy & 15-min cache | **₹0.00** | 100,000 requests/day, 10ms CPU/req, free SSL |
| **data.gov.in (CPCB)** | Primary real-time AQI API | **₹0.00** | Free government developer registration |
| **Total Monthly Cost** | | **₹0.00** | Zero recurring infrastructure expenses |

---

## 2. Step 1: Deploy the Cloudflare Worker Edge Proxy

Because Render Static Site serves precompiled static assets in the user's browser, direct requests to `data.gov.in` would expose your private API key and fail due to browser CORS policies. The lightweight Cloudflare Worker acts as a secure, cached reverse proxy.

### 2.1 Prerequisites
1. Free Cloudflare account at [cloudflare.com](https://cloudflare.com).
2. Free data.gov.in API key from [data.gov.in](https://data.gov.in).

### 2.2 Deployment Commands
From the project root:

```bash
# Navigate to the worker directory
cd worker

# Login to Cloudflare via Wrangler CLI
npx wrangler login

# Securely save your government API key as an encrypted secret
npx wrangler secret put DATA_GOV_IN_API_KEY
# (When prompted, paste your free data.gov.in API key)

# Deploy the worker to the global edge
npx wrangler deploy
```

Upon completion, Wrangler will output your live worker URL:
```
Published airscope-india-proxy (0.24 sec)
  https://airscope-india-proxy.<your-subdomain>.workers.dev
```

Test your worker endpoint in any browser or cURL:
```bash
curl https://airscope-india-proxy.<your-subdomain>.workers.dev/health
# Response: {"status":"ok","service":"airscope-edge-proxy"}
```

---

## 3. Step 2: Deploy Frontend on Render Static Site

### 3.1 Create Render Static Site
1. Sign up or log into [render.com](https://render.com).
2. Click **New +** > **Static Site**.
3. Connect your Git repository (e.g. `airscope-india`).

### 3.2 Configure Build Settings

| Setting Field | Exact Value |
| :--- | :--- |
| **Name** | `airscope-india` |
| **Branch** | `main` |
| **Root Directory** | *(Leave blank)* |
| **Build Command** | `npm install && STATIC_EXPORT=true npm run build` |
| **Publish Directory** | `out` |

### 3.3 Set Environment Variables on Render
Under the **Environment** tab on Render, add:

```env
STATIC_EXPORT=true
NEXT_PUBLIC_API_PROXY_URL=https://airscope-india-proxy.<your-subdomain>.workers.dev
NEXT_PUBLIC_SITE_URL=https://airscope-india.onrender.com
NEXT_PUBLIC_ENABLE_ADS=false
```

Click **Create Static Site**. Render will automatically build the Next.js static export and deploy it to `https://airscope-india.onrender.com`.

---

## 4. Alternative: Single-Service Fullstack Deployment on Render Web Service

If you prefer not to use Cloudflare Workers and want a single hosting service:
1. Create a **Render Web Service** (Free tier: 750 free instance hours/month).
2. Set Build Command: `npm install && npm run build`.
3. Set Start Command: `npm run start`.
4. Add environment variables:
   - `DATA_GOV_IN_API_KEY=<your_key>`
   - `NODE_ENV=production`
5. The built-in Next.js Route Handler at `/api/aqi` will automatically serve live data with zero additional proxy configuration.

---

## 5. Migrating to a Custom Domain (Future Upgrade)

When ready to add a custom domain (e.g. `airscope.in`):
1. Purchase a domain from any registrar (Namecheap, Cloudflare Registrar, etc.).
2. In Render Dashboard > Your Static Site > **Custom Domains** > Click **Add Custom Domain**.
3. Enter your domain: `airscope.in` and `www.airscope.in`.
4. Update your DNS settings at your registrar:
   - Add a `CNAME` record for `www` pointing to your Render subdomain (`airscope-india.onrender.com`).
   - Add an `A` or `ANAME/ALIAS` record for the apex domain pointing to the Render IP addresses shown in the dashboard.
5. Render will automatically issue a free Let's Encrypt SSL/TLS certificate.
6. Update `NEXT_PUBLIC_SITE_URL=https://airscope.in` in the environment variables and re-deploy.
