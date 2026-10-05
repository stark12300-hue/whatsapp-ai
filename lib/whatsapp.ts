export type SendTextResult = { messages?: Array<{ id: string }> };

function apiVersion() {
  const version = process.env.META_API_VERSION;
  if (!version) throw new Error('Missing META_API_VERSION');
  return version;
}

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export async function sendWhatsAppText(to: string, body: string): Promise<SendTextResult> {
  const phoneNumberId = required('META_PHONE_NUMBER_ID');
  const token = required('META_ACCESS_TOKEN');
  const url = `https://graph.facebook.com/${apiVersion()}/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { preview_url: false, body } })
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`WhatsApp send failed (${res.status}): ${detail}`);
  }
  return res.json();
}
