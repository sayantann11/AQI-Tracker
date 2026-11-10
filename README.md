# AirScope India — Real-Time Air Quality Intelligence Platform

> *"Know the air around you."*

AirScope India is a modern, high-precision, interactive air quality intelligence platform built specifically for the **National Capital Region (NCR)**—covering Delhi, Noida, Greater Noida, Gurugram, Faridabad, and Ghaziabad—with an architecture primed for pan-India expansion.

Built for deployment on **Render Static Sites** with an edge proxy on **Cloudflare Workers**, AirScope India delivers a zero-infrastructure-cost base (**₹0/month**) while maintaining scientific and legal integrity.

---

## 🌟 Key Product Differentiators

- **3D Environmental Particle Visualization**: Interactive Three.js particle sphere reacting dynamically to ambient pollution severity and respecting `prefers-reduced-motion`.
- **Interactive Delhi NCR Map**: Built on MapLibre GL JS with high-contrast Carto Dark Matter tiles, glowing CPCB-colored station pins, and detailed popups.
- **Strict CPCB National AQI Compliance**: Uses official Indian National Air Quality Index (NAQI) mathematical breakpoints and data sufficiency criteria (at least 3 pollutants with particulate matter).
- **Hyperlocal Telemetry Breakdown**: Live continuous sensor streams for $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, $\text{O}_3$, and $\text{NH}_3$.
- **Data Freshness Indicators**: Explicit `● Live` badges for active telemetry and `⚠️ Delayed` notices for readings older than 2 hours.
- **SEO Locality Pages**: Pre-rendered static pages for `/delhi`, `/noida`, `/gurugram`, `/ghaziabad`, `/faridabad`, `/delhi/anand-vihar`, `/delhi/dwarka`, `/delhi/rohini` with Schema.org JSON-LD structured data.
- **Zero CLS Monetization Architecture**: Pre-reserved display ad slots and an affiliate guide for certified HEPA purifiers and N95 respirators.
- **One-Click Locality Sharing**: Formatted share cards for WhatsApp, X, and direct link copying.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router) + React 18 + TypeScript 5 |
| **Styling & Design System** | Tailwind CSS (Dark Environmental Palette) + Lucide Icons |
| **3D Graphics** | Three.js (WebGL Particle Sphere & Core Glow) |
| **Geospatial Mapping** | MapLibre GL JS + Carto Dark Matter Vector/Raster Tiles |
| **Unit Testing** | Vitest (Automated NAQI math & normalizer test suite) |
| **Edge API Proxy** | Cloudflare Workers (Free tier: 100,000 requests/day) |
| **Hosting Platform** | Render Static Site (₹0 / month) |
| **Official Data Source** | CPCB CAAQMS via data.gov.in under GODL India License |

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- Node.js `v18.x` or higher (tested on `v24.x`)
- npm `v10.x` or higher

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/airscope-india.git
cd aqi-moniter

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials:
```env
# Optional for local test mode; required for live official CPCB feeds
DATA_GOV_IN_API_KEY=your_free_datagov_key_here

# Leave blank for local development to use local Next.js API route
NEXT_PUBLIC_API_PROXY_URL=

# Feature flags
STATIC_EXPORT=false
NEXT_PUBLIC_ENABLE_ADS=false
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Note on Developer Mode:** If you do not yet have a `data.gov.in` key, you can click **"Enable Test Fixtures Mode"** in the top navigation banner to test all visual components with authentic offline sample feeds.

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running the Automated Test Suite
```bash
npm run test
```
Executes all unit tests verifying CPCB mathematical breakpoints, 3-pollutant sufficiency rules, timestamp staleness detection, and coordinate distance algorithms.

### 6. Production Build
```bash
npm run build
```

---

## 🌐 Production Deployment (₹0 Cost Target)

Detailed deployment walk-throughs are available in the [`docs/`](./docs) directory:

1. **Edge Proxy Setup**: See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for one-line Cloudflare Worker deployment.
2. **Render Static Site Setup**: Set Build Command to `npm install && STATIC_EXPORT=true npm run build` and Publish Directory to `out`.
3. **Data Governance & Legal Compliance**: See [`docs/DATA_SOURCES.md`](./docs/DATA_SOURCES.md) for Government Open Data License (GODL) terms.
4. **Monetization & Ads**: See [`docs/MONETIZATION.md`](./docs/MONETIZATION.md) for AdSense subdomain caveats and affiliate setups.

---

## 📜 Statutory Data Attribution

AirScope India sources continuous ambient air quality readings published by the **Central Pollution Control Board (CPCB)** and contributing state boards (DPCC, UPPCB, HSPCB) via the Open Government Data Platform India (`data.gov.in`) under the **Government Open Data License – India (GODL)**.

In compliance with GODL provisions:
- Commercial reuse is permitted without royalty.
- No implied endorsement by the Government of India or CPCB is expressed or implied.
- AirScope India does not calculate fabricated interpolated readings between physical stations.

---

## 📄 License
This codebase is released under the **MIT License**.
