import { NextRequest } from 'next/server';
import { updateSettings } from '@/lib/store';

export const runtime = 'nodejs';

function authorized(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return !!token && !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const raw = String(body.text || '').trim();
  if (!raw) return Response.json({ error: 'No text supplied' }, { status: 400 });
  const items = raw.split(/\n(?:-{3,}|={3,})\n/g).map((x) => x.trim()).filter(Boolean).slice(-50);
  return Response.json(await updateSettings({ styleExamples: items }));
}
