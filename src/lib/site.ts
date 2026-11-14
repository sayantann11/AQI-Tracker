/**
 * Single source of truth for the public site URL and brand.
 * Order: explicit NEXT_PUBLIC_SITE_URL (non-localhost) -> Render's own URL -> known live URL.
 */
export const SITE_NAME = 'AirScope India';
export const SITE_TAGLINE = 'Live Delhi NCR Air Quality (AQI) Tracker';

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  // 'airscope-india.onrender.com' was a placeholder that never existed; ignore it if it is still set somewhere
  if (explicit && !explicit.includes('localhost') && !explicit.includes('airscope-india.onrender.com')) {
    return explicit.replace(/\/+$/, '');
  }
  const render = process.env.RENDER_EXTERNAL_URL;
  if (render) return render.replace(/\/+$/, '');
  return 'https://aqi-tracker-1d1s.onrender.com';
}

export const SITE_URL = getSiteUrl();
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'sayantann11@gmail.com';
