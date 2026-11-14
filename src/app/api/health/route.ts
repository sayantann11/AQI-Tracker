import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Lightweight: used by Render health checks and uptime pingers. Does not call upstream APIs.
export function GET() {
  return NextResponse.json({ ok: true, time: new Date().toISOString() });
}
