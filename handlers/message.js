// handlers/message.js — runs on each `message` update. The file name is the
// Telegram update type; the platform calls the default export with the matching
// payload (here, a Message). The full update is available as `ctx.update`.

import { api } from 'sdk';
import { addTodo, renderList } from 'lib/todos';
import { rememberUser } from 'lib/users';

const HELP = `I keep your todo list.

/list — show your todos
/help — this message

Send me any other text and I'll add it as a todo. Tap a todo to toggle it, or 🗑 to delete it.`;

export default async function (message) {
  const chatId = message.chat.id;
  const text = message.text?.trim();

  await rememberUser(message.from);

  // Not text (a sticker, photo, …) — point at /help.
  if (!text) {
    await api.sendMessage({ chat_id: chatId, text: 'Send me text to add a todo, or /help.' });
    return;
  }

  // Strip the "@botname" suffix commands carry in groups: "/list@my_bot" → "/list".
  const command = text.startsWith('/') ? text.split(/[@\s]/, 1)[0] : null;

  switch (command) {
    case '/start':
      await api.sendMessage({ chat_id: chatId, text: `Hi ${message.from?.first_name ?? 'there'}! ${HELP}` });
      return;

    case '/help':
      await api.sendMessage({ chat_id: chatId, text: HELP });
      return;

    case '/list': {
      const { text: listText, reply_markup } = await renderList(chatId);
      await api.sendMessage({ chat_id: chatId, text: listText, reply_markup });
      return;
    }

    case null: {
      // Plain text — add it as a todo and show the updated list.
      await addTodo(chatId, text);
      const { text: listText, reply_markup } = await renderList(chatId);
      await api.sendMessage({ chat_id: chatId, text: listText, reply_markup });
      return;
    }

    default:
      await api.sendMessage({ chat_id: chatId, text: `Unknown command ${command}. ${HELP}` });
  }
}
