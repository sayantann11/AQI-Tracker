# AirScope India — Final Performance & Bundle Optimization Report

**Date:** November 10, 2026  
**Framework:** Next.js 14 (App Router) + React 18 + Tailwind CSS  
**Bundler:** Webpack (Next.js production build)

---

## 1. Bundle Size & Code-Splitting Audit

### 1.1 Before vs After Code-Splitting Comparison

| Route | Pre-Optimization First Load JS | Post-Optimization First Load JS | Net Reduction | Status |
| :--- | :--- | :--- | :--- | :--- |
| **`/` (Homepage)** | **461 kB** | **123 kB** | **-338 kB (-73.3%)** | **OPTIMIZED** |
| **`/[city]`** | 99.8 kB | 100 kB | ~0 kB | Excellent |
| **`/delhi/[locality]`** | 99.8 kB | 100 kB | ~0 kB | Excellent |
| **`/noida/[locality]`** | 99.8 kB | 100 kB | ~0 kB | Excellent |
| **`/learn/*` (8 guides)**| 99.8 kB | 100 kB | ~0 kB | Excellent |
| **Shared Base Chunks** | 87.2 kB | 87.7 kB | +0.5 kB | Stable |

---

## 2. Heavy Third-Party Library Management

### 2.1 Three.js (`three` ~150 kB minified)
- **Problem:** `ThreeAQISphere` was previously imported statically in `HeroSection.tsx`, embedding Three.js directly in the critical rendering path.
- **Solution:** Replaced with dynamic client-side loading:
  ```typescript
  const ThreeAQISphere = dynamic(
    () => import('./ThreeAQISphere').then((m) => m.ThreeAQISphere),
    { ssr: false, loading: () => <PlaceholderGlow /> }
  );
  ```
- **Benefits:**
  - Zero Three.js code in initial server-sent HTML.
  - Page renders immediately with zero blocking time.
  - Graceful fallback animation during particle initialization.
  - Respects `prefers-reduced-motion` media queries.

### 2.2 MapLibre GL (`maplibre-gl` ~200 kB minified)
- **Problem:** `InteractiveMap` was statically bundled into `src/app/page.tsx`.
- **Solution:** Converted to dynamic import with `{ ssr: false }`:
  ```typescript
  const InteractiveMap = dynamic(
    () => import('@/components/InteractiveMap').then((m) => m.InteractiveMap),
    { ssr: false, loading: () => <MapLoadingSkeleton /> }
  );
  ```
- **Benefits:**
  - Avoids SSR `window` errors.
  - Loads geospatial shaders asynchronously after the primary content is painted.
  - Reduces Total Blocking Time (TBT) and improves First Input Delay (FID / INP).

---

## 3. Core Web Vitals Projection

| Metric | Target | Projected Status | Contributing Factors |
| :--- | :--- | :--- | :--- |
| **LCP (Largest Contentful Paint)** | < 2.5s | **FAST** | Critical H1 and hero station card are pre-rendered into HTML; no WebGL blocking. |
| **FID / INP (Input Responsiveness)**| < 100ms | **FAST** | Heavy 3D calculations deferred; main JS thread remains free during page load. |
| **CLS (Cumulative Layout Shift)** | < 0.1 | **EXCELLENT** | Explicit reserved dimensions on map container (`h-[520px]`) and 3D canvas (`h-[320px]`). Ad slots reserve min-height. |
| **TTFB (Time to First Byte)** | < 0.8s | **FAST** | Pre-rendered static pages served directly from edge CDN cache. |

*(Note: Live Core Web Vitals under real user traffic will be monitored in Google Search Console once deployed).*
