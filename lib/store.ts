import { FieldValue } from 'firebase-admin/firestore';
import { db } from './firebase-admin';

export type ChatMessage = {
  waId: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt?: unknown;
};

const settingsRef = () => db().collection('whatsapp_ai').doc('settings');
const chatRef = (waId: string) => db().collection('whatsapp_ai').doc('chats').collection(waId).doc();
const processedRef = (messageId: string) => db().collection('whatsapp_ai').doc('processed').collection('messages').doc(messageId);

export async function getSettings() {
  const snap = await settingsRef().get();
  return snap.exists ? snap.data()! : {
    busyMode: true,
    autoReplyEnabled: true,
    personality: 'Casual, natural Hinglish. Keep replies concise unless the conversation needs detail.',
    boundaries: 'Do not invent facts, promises, payments, commitments, or personal plans.',
    styleExamples: []
  };
}

export async function updateSettings(patch: Record<string, unknown>) {
  await settingsRef().set(patch, { merge: true });
  return getSettings();
}

export async function wasProcessed(messageId: string) {
  return (await processedRef(messageId).get()).exists;
}

export async function markProcessed(messageId: string) {
  await processedRef(messageId).set({ createdAt: FieldValue.serverTimestamp() });
}

export async function saveMessage(message: Omit<ChatMessage, 'createdAt'>) {
  await chatRef(message.waId).set({ ...message, createdAt: FieldValue.serverTimestamp() });
}

export async function getRecentMessages(waId: string, limit = 12): Promise<ChatMessage[]> {
  const snap = await db().collection('whatsapp_ai').doc('chats').collection(waId)
    .orderBy('createdAt', 'desc').limit(limit).get();
  return snap.docs.reverse().map((doc) => doc.data() as ChatMessage);
}
