# AirScope India — Comprehensive SEO Audit Report

**Date:** November 2026  
**Target Search Market:** Delhi NCR, India  
**Primary Target Queries:** "Delhi AQI", "Delhi AQI today", "Delhi air quality live", "Anand Vihar AQI", "Dwarka AQI"  
**Platform Architecture:** Next.js 14 App Router, SSG (Static Site Generation), CPCB CAAQMS Real-Time Data  

---

## 1. Executive Summary

AirScope India is designed to be the premier hyperlocal air quality intelligence platform for Delhi NCR. This technical and content SEO audit evaluates the existing website, compares it against market leaders (such as AQI.in, IQAir, and CPCB official portals), identifies algorithmic ranking barriers, and specifies direct code-level remediations.

---

## 2. Competitive Benchmarking

| SEO Dimension | CPCB Official Portal | AQI.in | IQAir (Delhi) | AirScope India (Audited State) | AirScope India (Target State) |
|---|---|---|---|---|---|
| **Domain Authority / Backlinks** | Very High (.gov.in) | High (Commercial) | Very High (Global) | Low (New launch) | Growing (Digital PR + Open Data citations) |
| **Page Speed & Core Web Vitals** | Poor (Legacy ASP.NET/Table UI) | Moderate (Heavy ad scripts) | Moderate (Complex client bundles) | Fast (SSG + Tailwind) | Superior (< 1.5s LCP, zero layout shifts) |
| **Mobile Experience** | Poor | Good | Good | Excellent | Exceptional (Mobile-first responsive UI) |
| **Hyperlocal Station Pages** | Static tables only | Dedicated pages | Dedicated city/station | Formerly 3 localities | **17+ Delhi + Noida Dedicated Station Pages** |
| **Structured Data (Schema.org)** | None | Basic Article | LocalBusiness / Organization | Basic WebSite | **WebSite + Organization + Breadcrumbs + FAQPage + Article** |
| **Educational Depth** | Government PDF reports | Moderate | Good | Missing | **Knowledge Centre (/learn/*) with 7 deep guides** |
| **Ad / Tracking Clutter** | None | High (Aggressive banners) | Moderate | Low (Zero CLS slots) | Clean, non-intrusive, zero Cumulative Layout Shift |

---

## 3. SEO Issues Identified & Categorised

### Critical Priority Issues (Resolved in this Implementation)
1. **Locality Coverage Gap:**
   - *Problem:* Previously, only 3 localities (`anand-vihar`, `dwarka`, `rohini`) were generated as static pages, missing 14+ official DPCC/CPCB monitoring stations in Delhi (such as ITO, Punjabi Bagh, R.K. Puram, Okhla, Bawana, Wazirpur, Jahangirpuri) and major satellite cities like Noida.
   - *Fix:* Expanded static generation across all 17+ Delhi CAAQMS stations and Noida sectors (`/noida/noida-sector-62`, `/noida/noida-sector-125`, `/noida/noida-sector-1`).

2. **Absence of Long-Tail Educational Content:**
   - *Problem:* Users frequently search informational queries ("What is PM2.5?", "How is AQI calculated in India?", "Is Delhi AQI dangerous?"). Without informational content, domain topical authority remained flat.
   - *Fix:* Built a dedicated **Knowledge Centre (`/learn/*`)** with 7 in-depth guides formatted with Schema.org `Article` and `BreadcrumbList` schemas.

3. **Homepage Search Intent Mismatch:**
   - *Problem:* Title was previously generic ("AirScope India — Real-Time Air Quality Intelligence"), failing to target the highest-volume search query: "Delhi AQI Today".
   - *Fix:* Optimized default metadata title to `"Delhi AQI Today – Live Air Quality & Pollution Map | AirScope India"` with an intent-matched meta description.

### High Priority Issues (Resolved in this Implementation)
4. **Static XML Sitemap Incompleteness:**
   - *Problem:* `src/app/sitemap.ts` hardcoded only 5 city URLs and 3 localities, omitting satellite stations and educational guides.
   - *Fix:* Implemented dynamic sitemap generation leveraging `DELHI_NCR_STATIONS` fixture to automatically index all city, locality, and educational routes with appropriate change frequencies and priorities.

5. **Schema.org Rich Snippet Coverage:**
   - *Problem:* Missing `FAQPage` schema on city and locality pages; missing `BreadcrumbList` navigation schema for Google SERP rich snippets.
   - *Fix:* Added JSON-LD `BreadcrumbList` and `FAQPage` schemas with verified CPCB questions and answers to all city and locality routes.

### Medium Priority Issues & Opportunities
6. **Network Preconnect Optimization:**
   - Added preconnect tags in root layout for `api.data.gov.in` and CartoDB basemap CDN tiles to accelerate initial telemetry and map rendering.
7. **Crawler Disallow Rules:**
   - Refined `robots.ts` to explicitly disallow `/_next/` build assets and internal `/api/` proxy routes while granting full indexing privileges to Googlebot.

---

## 4. Crawlability & Indexation Summary

- **Total Static Indexable Routes:** 30+ URLs
  - Root: `/` (Priority 1.0)
  - Regional Hub: `/learn` (Priority 0.7)
  - City Pages: `/delhi`, `/noida`, `/gurugram`, `/ghaziabad`, `/faridabad` (Priority 0.8)
  - Delhi Localities: 17 individual CAAQMS station landing pages (Priority 0.85)
  - Noida Localities: 3 sector landing pages (Priority 0.75)
  - Knowledge Centre Articles: 7 educational deep-dives (Priority 0.65)
- **Robots Directives:** `index, follow, max-image-preview:large, max-snippet:-1`
- **Canonicalization:** Every page declares an absolute canonical URL matching `https://airscope-india.onrender.com` or custom domain.
