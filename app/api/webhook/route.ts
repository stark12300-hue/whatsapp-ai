import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest } from 'next/server';
import { generateReply } from '@/lib/ai';
import { getSettings, markProcessed, saveMessage, wasProcessed } from '@/lib/store';
import { sendWhatsAppText } from '@/lib/whatsapp';

export const runtime = 'nodejs';

function verifyToken(request: NextRequest) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  const expected = process.env.META_VERIFY_TOKEN;
  if (mode === 'subscribe' && token && expected && token === expected && challenge) return challenge;
  return null;
}

export async function GET(request: NextRequest) {
  const challenge = verifyToken(request);
  if (!challenge) return new Response('Forbidden', { status: 403 });
  return new Response(challenge, { status: 200 });
}

function validSignature(rawBody: string, signature: string | null) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) return false;
  if (!signature?.startsWith('sha256=')) return false;
  const expected = createHmac('sha256', appSecret).update(rawBody).digest('hex');
  const provided = signature.slice('sha256='.length);
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!validSignature(rawBody, request.headers.get('x-hub-signature-256'))) {
      return Response.json({ ok: false }, { status: 401 });
    }
    const body = JSON.parse(rawBody);
    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const messages = value?.messages;
    if (!Array.isArray(messages) || messages.length === 0) return Response.json({ ok: true });

    const settings = await getSettings();
    if (!settings.autoReplyEnabled || !settings.busyMode) return Response.json({ ok: true, skipped: true });

    for (const message of messages) {
      if (message?.type !== 'text') continue;
      const waId = message?.from;
      const text = message?.text?.body;
      const messageId = message?.id;
      if (!waId || !text || !messageId) continue;
      if (await wasProcessed(messageId)) continue;
      await markProcessed(messageId);
      await saveMessage({ waId, role: 'user', text });
      const reply = await generateReply(waId, text);
      await sendWhatsAppText(waId, reply);
      await saveMessage({ waId, role: 'assistant', text: reply });
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ ok: false }, { status: 200 });
  }
}
