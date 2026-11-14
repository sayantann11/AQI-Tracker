// Serves /ads.txt for Google AdSense. Set NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
export const dynamic = 'force-dynamic';

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '';
  const pub = client.replace(/^ca-/, '');
  const body = pub.startsWith('pub-')
    ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
    : '# ads.txt: set NEXT_PUBLIC_ADSENSE_CLIENT_ID to publish your AdSense line\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
