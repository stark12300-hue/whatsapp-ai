# WhatsApp AI You

A starter AI auto-reply assistant for the WhatsApp Cloud API. It uses OpenAI to draft replies in your texting style and Firestore for recent conversation context and settings.

## Features

- WhatsApp Cloud API webhook
- OpenAI Responses API replies
- Firestore conversation memory
- Style/personality instructions and example replies
- Busy Mode and Auto Reply switches
- Simple /admin control panel
- Webhook verification and HMAC signature validation
- Duplicate message protection

## Important

This project is for the official WhatsApp Business / Cloud API. It does not automate a normal personal WhatsApp account through unofficial methods.

Never commit real API keys, Meta tokens, Firebase private keys, OTPs, passwords, or private chat exports. Put secrets in deployment environment variables.

## Environment variables

See .env.example for:
OPENAI_API_KEY, OPENAI_MODEL, META_ACCESS_TOKEN, META_PHONE_NUMBER_ID, META_VERIFY_TOKEN, META_APP_SECRET, META_API_VERSION, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, ADMIN_TOKEN.

## Run

```bash
npm install
npm run dev
```

Open /admin to configure the assistant.

## Webhook

Set the Meta webhook callback URL to:

`https://YOUR-DOMAIN/api/webhook`

Use the same META_VERIFY_TOKEN in Meta's webhook verification settings.

## Safety

Start with a test number and conservative boundaries. For sensitive messages involving money, medical/legal matters, commitments, or relationship conflicts, use an approval workflow before automatic sending.
