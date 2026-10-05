import OpenAI from 'openai';

let client: OpenAI | null = null;

export function openai() {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}
