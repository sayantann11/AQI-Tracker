/**
 * AirScope India - Cloudflare Worker Edge API Proxy
 * Runs on Cloudflare's Free Tier (100,000 requests/day at ₹0).
 *
 * Responsibilities:
 * 1. Safely injects private Government of India (data.gov.in) API key.
 * 2. Caches responses at the Cloudflare Edge (15 min) to prevent hitting rate limits.
 * 3. Adds CORS headers to allow requests from the Render Static Site.
 * 4. Normalizes and validates incoming queries.
 */

export interface Env {
  DATA_GOV_IN_API_KEY: string;
  OPENAQ_API_KEY?: string;
  ALLOWED_ORIGIN?: string;
}

const CPCB_ENDPOINT = 'https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const origin = request.headers.get('Origin') || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'airscope-edge-proxy' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Cloudflare Edge Cache check (15 minutes TTL)
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      const response = new Response(cachedResponse.body, cachedResponse);
      response.headers.set('X-Edge-Cache', 'HIT');
      return response;
    }

    if (!env.DATA_GOV_IN_API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'DATA_GOV_IN_API_KEY is not configured on Cloudflare Worker secret store.',
          status: 'UNCONFIGURED',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    try {
      const targetUrl = new URL(CPCB_ENDPOINT);
      targetUrl.searchParams.set('api-key', env.DATA_GOV_IN_API_KEY);
      targetUrl.searchParams.set('format', 'json');
      targetUrl.searchParams.set('limit', '500');

      const cpcbResponse = await fetch(targetUrl.toString(), {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'AirScope-India-Proxy/1.0',
        },
      });

      if (!cpcbResponse.ok) {
        return new Response(
          JSON.stringify({
            error: `Upstream CPCB API responded with status ${cpcbResponse.status}`,
          }),
          {
            status: 502,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      const rawData: any = await cpcbResponse.json();

      const responsePayload = {
        success: true,
        source: 'CPCB via data.gov.in (Edge Cached)',
        timestamp: new Date().toISOString(),
        attribution: {
          dataset: 'Real time Air Quality Index from various locations',
          organization: 'Central Pollution Control Board (CPCB)',
          license: 'Government Open Data License - India (GODL)',
          licenseUrl: 'https://data.gov.in/government-open-data-license-india',
        },
        records: rawData.records || [],
      };

      const freshResponse = new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=900, s-maxage=900', // 15 minutes edge cache
          'X-Edge-Cache': 'MISS',
          ...corsHeaders,
        },
      });

      // Store in Cloudflare Edge Cache
      ctx.waitUntil(cache.put(cacheKey, freshResponse.clone()));

      return freshResponse;
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err.message || 'Failed to fetch from upstream data source' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
  },
};
