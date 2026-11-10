# AirScope India — Technical SEO Specification & Audit

This document outlines the technical SEO architecture, structured data schemas, crawl directives, performance optimizations, and indexation controls implemented in AirScope India.

---

## 1. Technical Framework & Rendering Architecture

- **Framework:** Next.js 14 (App Router) + TypeScript 5
- **Rendering Strategy:** Static Site Generation (SSG) with incremental static generation for metadata and JSON-LD schemas.
- **Production HTML:** Fully pre-rendered static HTML at build time for instant search engine indexing (no JavaScript rendering required for Googlebot to read core content, tables, and schemas).
- **Edge Deployment:** Render Static Hosting / Cloudflare Pages ready with zero server latency on static routes.

---

## 2. Structured Data (Schema.org JSON-LD) Implementation

All pages include verified, validated Schema.org JSON-LD scripts embedded in the `<head>` or page body:

### A. WebSite & Organization (Global in `src/app/layout.tsx`)
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AirScope India",
  "url": "https://airscope-india.onrender.com",
  "description": "Real-time air quality intelligence platform for Delhi NCR based on official CPCB continuous ambient air quality monitoring station (CAAQMS) data.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://airscope-india.onrender.com/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AirScope India",
  "url": "https://airscope-india.onrender.com",
  "logo": "https://airscope-india.onrender.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "areaServed": "IN",
    "availableLanguage": "English"
  }
}
```

### B. BreadcrumbList (City, Locality, and Learn Pages)
Enables breadcrumb paths in Google search results (`Home > Delhi AQI > Anand Vihar AQI`):
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://airscope-india.onrender.com" },
    { "@type": "ListItem", "position": 2, "name": "Delhi AQI", "item": "https://airscope-india.onrender.com/delhi" },
    { "@type": "ListItem", "position": 3, "name": "Anand Vihar AQI", "item": "https://airscope-india.onrender.com/delhi/anand-vihar" }
  ]
}
```

### C. FAQPage (City & Locality Landing Pages)
Enables FAQ rich snippets directly in Google SERP results for high CTR:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Anand Vihar AQI today?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Anand Vihar AQI today is tracked by the DPCC continuous monitoring station in Delhi..."
      }
    }
  ]
}
```

### D. Article (Knowledge Centre `/learn/*`)
Signals journalistic and educational authority with headline, author, publisher, and timestamps.

---

## 3. Crawler Directives: `robots.txt` & `sitemap.xml`

### Robots Configuration (`src/app/robots.ts`)
- Allows full crawl access for Googlebot, Bingbot, and standard web spiders across all public content (`/`, `/delhi/*`, `/noida/*`, `/learn/*`).
- Restricts internal API route (`/api/`) and build artifacts (`/_next/`) to preserve crawl budget.
- Points directly to the canonical XML sitemap location.

### Dynamic XML Sitemap (`src/app/sitemap.ts`)
- Automatically populates all 41+ static routes directly from the station registry and learning guides.
- Categorizes priorities:
  - Homepage: `1.0` (Hourly)
  - Locality Pages: `0.85` (Hourly)
  - City Pages: `0.80` (Hourly)
  - Noida Sectors: `0.75` (Hourly)
  - Knowledge Hub: `0.70` (Weekly)
  - Educational Guides: `0.65` (Monthly)

---

## 4. Core Web Vitals Optimization

| Metric | Target | AirScope Implementation |
|---|---|---|
| **LCP (Largest Contentful Paint)** | < 1.8s | Pre-rendered hero typography, font-display: swap, DNS preconnect to official API CDNs |
| **FID / INP (Interaction to Next Paint)** | < 100ms | Lightweight React tree, zero third-party tracking baggage |
| **CLS (Cumulative Layout Shift)** | 0.00 | Fixed aspect-ratio containers for 3D sphere and MapLibre canvas; reserved layout slots for sponsors |
