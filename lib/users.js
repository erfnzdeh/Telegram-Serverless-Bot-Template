// lib/users.js — keep a row per Telegram user, refreshed on every message.
// Demonstrates upsert via onConflictDoUpdate.

import { db } from 'sdk';
import { users } from 'schema';

export async function rememberUser(from) {
  if (!from) return;
  await db.insert(users)
    .values({
      tgId: from.id,
      name: from.first_name ?? 'unknown',
      lang: from.language_code ?? 'en',
    })
    .onConflictDoUpdate({
      target: users.tgId,
      set: {
        name: from.first_name ?? 'unknown',
        lang: from.language_code ?? 'en',
      },
    })
    .run();
}
