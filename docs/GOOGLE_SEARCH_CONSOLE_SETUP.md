# Google Search Console & Bing Webmaster Tools Setup Guide

Step-by-step instructions for the website owner to verify domain ownership, submit the XML sitemap, monitor search performance, and inspect indexing status.

---

## Part 1: Google Search Console (GSC) Setup

### Step 1: Add Your Property
1. Navigate to [Google Search Console](https://search.google.com/search-console).
2. Sign in with your Google account.
3. Click **"Add Property"** from the top-left dropdown.
4. Choose **URL prefix**:
   - For free Render URL: `https://airscope-india.onrender.com` (or your exact deployed URL)
   - For future custom domain: `https://www.yourdomain.com` or Domain property if you manage DNS.
5. Click **Continue**.

### Step 2: Verify Ownership (HTML Tag or File)
Google provides several verification methods. The two easiest for this Next.js project:

#### Option A: HTML Tag (Recommended)
1. In Search Console, select **HTML tag** under "Other verification methods".
2. Copy the `<meta name="google-site-verification" content="YOUR_CODE" />` code.
3. Add it to `src/app/layout.tsx` metadata verification property:
   ```ts
   verification: {
     google: 'YOUR_CODE_HERE',
   },
   ```
4. Deploy the update and click **Verify** in Search Console.

#### Option B: Google Analytics / Tag Manager
If you add Google Analytics 4, Search Console can verify ownership automatically with one click.

### Step 3: Submit Your XML Sitemap
1. In Google Search Console, click on **Sitemaps** in the left navigation sidebar under "Index".
2. Under "Add a new sitemap", enter:
   ```
   sitemap.xml
   ```
3. Click **Submit**.
4. You will see a success status: *"Sitemap submitted successfully. Google will periodically process it and look for changes."*
5. Check back within 24–48 hours to confirm that all 41+ URLs have been discovered and queued for indexing.

---

## Part 2: Bing Webmaster Tools Setup

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Sign in with your Microsoft or Google account.
3. Bing offers an instant **"Import from Google Search Console"** button. Click it.
4. Grant permission; Bing will automatically import your verified domain, sitemap URL, and URL inspection data without needing additional verification tags.

---

## Part 3: Ongoing Performance Monitoring Checklist

Once verified and indexing begins:
1. **Performance Report (Weekly):**
   - Track impressions and click-through rates (CTR) for target queries: *"Delhi AQI today"*, *"Anand Vihar AQI"*, *"Dwarka AQI"*.
2. **URL Inspection Tool:**
   - Use the URL inspection search bar at the top to test live URLs and click **"Request Indexing"** for newly published pages to accelerate Googlebot discovery.
3. **Core Web Vitals Report:**
   - Confirm all URLs remain in the "Good" (green) category on both Mobile and Desktop devices.
4. **Rich Results Test:**
   - Test any URL on the official [Google Rich Results Test](https://search.google.com/test/rich-results) to verify that `BreadcrumbList`, `FAQPage`, and `Article` schemas are parsed without errors or warnings.
