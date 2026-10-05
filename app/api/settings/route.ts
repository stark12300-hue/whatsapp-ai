import { NextRequest } from 'next/server';
import { getSettings, updateSettings } from '@/lib/store';

export const runtime = 'nodejs';

function authorized(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return !!token && !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  return Response.json(await getSettings());
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const clean = {
    busyMode: Boolean(body.busyMode),
    autoReplyEnabled: Boolean(body.autoReplyEnabled),
    personality: String(body.personality || '').slice(0, 4000),
    boundaries: String(body.boundaries || '').slice(0, 4000),
    styleExamples: Array.isArray(body.styleExamples) ? body.styleExamples.map(String).slice(-50) : []
  };
  return Response.json(await updateSettings(clean));
}
