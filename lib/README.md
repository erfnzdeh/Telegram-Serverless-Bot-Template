# lib/ — shared modules

Everything that isn't an entry point lives here: database access, rendering,
validation, API wrappers. Unlike `handlers/`, this folder allows subdirectories
(`lib/internal/util.js`), and file names carry no special meaning — a lib module
runs only when another module imports it.

## Importing — the rule that bites

Modules are addressed by **bare name in the project's module space**, not by
filesystem path:

```js
import { addTodo } from 'lib/todos';   // ✅
import { users } from 'schema';        // ✅
import { db, api } from 'sdk';         // ✅ the platform SDK

import { addTodo } from './todos';     // ❌ relative paths won't compile
import { addTodo } from 'lib/todos.js';// ❌ no .js extension
import _ from 'lodash';                // ❌ no npm packages at runtime
```

The runtime resolves `lib/todos` as a name, the same way it resolves `sdk` — the
filesystem layout only matters at deploy time.

## How the demo splits responsibilities

- [todos.js](todos.js) — **all** todo database access, plus `renderList()`, the
  one function that turns rows into `{ text, reply_markup }`. Both handlers call
  it, which is exactly why it lives here: the message handler renders the list
  when you add a todo, and the callback handler re-renders it after a button tap.
  If each handler built its own keyboard, the two would drift apart — and the
  `callback_data` strings the keyboard embeds (`toggle:<id>`, `delete:<id>`) are
  a contract with `handlers/callback_query.js`, so they should be written in
  exactly one place.
- [users.js](users.js) — the smallest useful pattern: an idempotent upsert
  (`onConflictDoUpdate`) that keeps one row per Telegram user fresh on every
  message.

The guideline the demo follows: **handlers decide, lib does.** A handler parses
the update and picks a branch; the queries, the keyboard layout, and any
cross-handler contract live here. That keeps handlers readable top-to-bottom and
makes logic testable via `npx tgcloud run` with different payloads.

Note that `lib/todos.js` scopes every query by `chatId`, including toggle and
delete — the ids arriving in `callback_data` are user-supplied input, and the
platform has no foreign keys or row-level security to catch a forged id. Guarding
ownership in the query itself is the pattern to copy.

> Only `.js` files deploy — this README stays local.
