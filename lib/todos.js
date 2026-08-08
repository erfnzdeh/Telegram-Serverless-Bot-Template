// lib/todos.js — all database access for todos, plus the shared list renderer
// used by both the message and callback_query handlers.

import { db } from 'sdk';
import { eq, and, asc } from 'sdk/db';
import { todos } from 'schema';

export async function addTodo(chatId, text) {
  const [row] = await db.insert(todos)
    .values({ chatId, text })
    .returning()
    .run();
  return row;
}

export async function toggleTodo(chatId, id) {
  const row = await db.select().from(todos)
    .where(and(eq(todos.id, id), eq(todos.chatId, chatId)))
    .get();
  if (!row) return null;
  await db.update(todos)
    .set({ done: !row.done })
    .where(eq(todos.id, id))
    .run();
  return { ...row, done: !row.done };
}

export async function deleteTodo(chatId, id) {
  await db.delete(todos)
    .where(and(eq(todos.id, id), eq(todos.chatId, chatId)))
    .run();
}

export async function listTodos(chatId) {
  return db.select().from(todos)
    .where(eq(todos.chatId, chatId))
    .orderBy(asc(todos.done), asc(todos.id))
    .all();
}

// Renders the todo list as message text + an inline keyboard. Each todo gets a
// toggle button and a delete button; callback_data stays well under Telegram's
// 64-byte limit (see handlers/callback_query.js for the matching parser).
export async function renderList(chatId) {
  const rows = await listTodos(chatId);
  if (rows.length === 0) {
    return { text: 'Nothing on the list. Send me a task to add it!' };
  }
  const open = rows.filter((r) => !r.done).length;
  return {
    text: `📋 Your todos — ${open} open, ${rows.length - open} done`,
    reply_markup: {
      inline_keyboard: rows.map((r) => [
        { text: `${r.done ? '✅' : '⬜️'} ${r.text}`, callback_data: `toggle:${r.id}` },
        { text: '🗑', callback_data: `delete:${r.id}` },
      ]),
    },
  };
}
