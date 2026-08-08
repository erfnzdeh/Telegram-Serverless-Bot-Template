// handlers/callback_query.js — runs when a user taps an inline keyboard button.
// The payload is a CallbackQuery; `callback_query.data` is whatever string the
// button carried (set in lib/todos renderList: "toggle:<id>" / "delete:<id>").

import { api, BotApiError } from 'sdk';
import { toggleTodo, deleteTodo, renderList } from 'lib/todos';

export default async function (query) {
  const message = query.message;
  const [action, idRaw] = (query.data ?? '').split(':');
  const id = Number(idRaw);

  // Always answer the callback query — otherwise the client shows a spinner
  // on the button for up to a minute.
  if (!message || !Number.isInteger(id)) {
    await api.answerCallbackQuery({ callback_query_id: query.id });
    return;
  }

  const chatId = message.chat.id;
  let notice;

  if (action === 'toggle') {
    const row = await toggleTodo(chatId, id);
    notice = row ? (row.done ? 'Done ✅' : 'Reopened ⬜️') : 'Already gone';
  } else if (action === 'delete') {
    await deleteTodo(chatId, id);
    notice = 'Deleted 🗑';
  }

  await api.answerCallbackQuery({ callback_query_id: query.id, text: notice });

  // Re-render the list in place.
  const { text, reply_markup } = await renderList(chatId);
  try {
    await api.editMessageText({
      chat_id: chatId,
      message_id: message.message_id,
      text,
      reply_markup,
    });
  } catch (err) {
    // Two taps in quick succession can race to identical content; Telegram
    // rejects the no-op edit with "message is not modified" — safe to ignore.
    if (err instanceof BotApiError && err.description?.includes('message is not modified')) return;
    throw err;
  }
}
