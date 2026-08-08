# handlers/ — where updates enter your bot

Every file in this folder is an **entry point**, and its name is a contract: it must
match a [Telegram update type](https://core.telegram.org/bots/api#update) exactly.
When Telegram has news for your bot — a message arrived, a button was tapped, a
member joined — it wraps it in an `Update` object, and the platform routes it to
the file named after the update's type:

| Update arrives with… | …runs this file | payload type |
|---|---|---|
| `update.message` | `message.js` | [Message](https://core.telegram.org/bots/api#message) |
| `update.callback_query` | `callback_query.js` | [CallbackQuery](https://core.telegram.org/bots/api#callbackquery) |
| `update.inline_query` | `inline_query.js` | [InlineQuery](https://core.telegram.org/bots/api#inlinequery) |
| `update.chat_member` | `chat_member.js` | [ChatMemberUpdated](https://core.telegram.org/bots/api#chatmemberupdated) |
| any other update type | `<update_type>.js` | the matching object |

Two rules follow from this design:

- **This folder is flat.** No subdirectories — a file here means "handle this
  update type", nothing else. Shared logic goes in [`lib/`](../lib/).
- **The files that exist decide what your bot receives.** On `push`, the platform
  builds the webhook's `allowed_updates` from this folder. No `callback_query.js`
  (or an empty one) → Telegram never sends callback queries at all. To start
  handling a new update type, just add the file: `npx tgcloud add handlers/inline_query`.

## The handler signature

Each file default-exports one async function:

```js
export default async function (payload, ctx) {
  // payload — the unwrapped object for this update type.
  //           In message.js it's the Message itself, not the whole Update.
  // ctx     — per-invocation context; ctx.update is the raw Update
  //           (with update_id) if you ever need it.
}
```

There is nothing to return — a handler *does* things (calls `api.*`, writes to
`db`) rather than producing a response. When it resolves, the invocation is done.

## What the demo handlers show

- [message.js](message.js) — the classic shape of a message handler: guard against
  non-text messages, split commands from plain text (including the `/cmd@botname`
  form Telegram uses in groups), route with a `switch`, and keep every branch to
  "call a lib function, send the result".
- [callback_query.js](callback_query.js) — the callback-query contract:
  **always** `answerCallbackQuery` (or the user's client spins for up to a
  minute), parse the `callback_data` string you chose when building the keyboard,
  then edit the original message in place. It also shows real-world error
  handling: two fast taps can race to identical content, and Telegram rejects the
  no-op edit with a 400 `"message is not modified"` — an error worth catching and
  ignoring, unlike most.

## Testing a handler without Telegram

`npx tgcloud run` executes a handler server-side with a payload you make up:

```bash
npx tgcloud run handlers/message '{ chat: { id: 1 }, text: "/help" }'
npx tgcloud run handlers/message '{ chat: { id: 1 }, text: "buy milk" }'
```

`console.log` output from the handler shows up in your terminal, tagged with
`[file:line]`.

> Only `.js` files deploy — this README stays local.
