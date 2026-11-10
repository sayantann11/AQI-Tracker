# AirScope India — Monetization Strategy & Advertising Roadmap

This document outlines the multi-tiered revenue model designed for AirScope India, including advertising eligibility realities on free subdomains, affiliate revenue mechanics, and future B2B product offerings.

---

## 1. Display Advertising Strategy & Technical Guardrails

AirScope India features pre-engineered, layout-stable advertising slots designed to monetize organic search traffic without compromising user experience or Core Web Vitals.

### 1.1 Zero Cumulative Layout Shift (CLS) Architecture
To prevent jarring visual shifts when ad banners asynchronously hydrate:
- Every `AdSlot` component enforces strict minimum dimensions (e.g., `min-h-[90px]` for leaderboards, `min-h-[250px]` for inline rectangles).
- Content below the slot never jumps downward during ad rendering.
- All ad components are toggleable via a centralized feature flag:
  ```env
  NEXT_PUBLIC_ENABLE_ADS=false # Set to true once approved
  NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
  ```

### 1.2 Realistic Advertising Eligibility on Free Subdomains

> [!WARNING]
> **AdSense Policy on Free Subdomains (`.onrender.com`):**
> Google AdSense generally requires a custom, top-level domain (TLD such as `.in` or `.com`) for initial publisher site approval. Subdomains on hosting platforms (`.onrender.com`, `.vercel.app`, `.github.io`) are typically rejected under AdSense Site Ownership and Webmaster Guidelines unless the developer already holds a previously approved parent AdSense publisher account.

#### Pragmatic Solutions:
1. **Initial Free Launch Phase (₹0)**: Keep `NEXT_PUBLIC_ENABLE_ADS=false`. Focus organic SEO traffic on the curated Affiliate Showcase and direct sponsor placements.
2. **Alternative Ad Networks for Free Subdomains**:
   - **Carbon Ads / BuySellAds**: Premium tech/environmental audience network accepting high-quality niche platforms.
   - **PropellerAds / Adsterra**: Accept subdomains, though ad quality must be strictly monitored to maintain a premium feel.
3. **Custom Domain Migration**: When initial traffic traction is established, purchasing a `.in` domain (~₹400-₹700/year) unlocks full Google AdSense eligibility and increases search engine trust.

---

## 2. Clean Air Affiliate Marketing (Immediate Revenue Stream)

Affiliate marketing operates independently of domain restrictions and provides immediate monetization potential, especially during peak seasonal pollution in Delhi NCR (October through February).

### 2.1 Product Categories & Commission Structures

| Category | Typical Price (INR) | Commission Rate | Target Seasonal Window |
| :--- | :--- | :--- | :--- |
| **True HEPA Air Purifiers** (Philips, Coway, Dyson, Xiaomi) | ₹9,000 – ₹35,000 | 2.5% – 5.0% | October – February |
| **Replacement HEPA Filters** (Annual consumables) | ₹1,500 – ₹4,500 | 4.0% – 6.0% | Year-round (recurring) |
| **N95/FFP2 Respirator Multipacks** (3M, Honeywell) | ₹400 – ₹1,200 | 5.0% – 8.0% | Peak smog spikes |
| **Laser Indoor Air Monitors** (Airveda, Temtop) | ₹4,500 – ₹15,000 | 4.0% – 6.0% | Year-round |

### 2.2 Editorial & Compliance Standards
- Every product featured must specify verified filtration certifications (e.g. HEPA H13, NIOSH N95).
- Clear statutory disclosure is displayed directly underneath the showcase: *"AirScope India participates in select affiliate programmes. We may earn a commission from qualifying purchases at no additional cost to you."*
- Affiliate links include `rel="sponsored noopener noreferrer"` attributes in compliance with search engine guidelines.

---

## 3. Future B2B Revenue Opportunities

As station coverage and user authority expand, the underlying normalized data pipeline can power higher-margin B2B offerings:

### 3.1 Embeddable AQI Widgets for Housing Societies (RWAs)
- Residential welfare associations across Gurugram, Noida, and South Delhi display community lobby screens.
- Reusable iframe/React widget displaying the society's nearest official station reading and morning jogging guidance.

### 3.2 School Sports & Health Safety Dashboards
- Custom portal for private schools across NCR to automate morning outdoor sports safety determinations based on real-time CPCB GRAP stage triggers.

### 3.3 Corporate ESG Air Quality Compliance Reporting
- Monthly automated environmental summaries for commercial business parks tracking regional ambient exposure.
