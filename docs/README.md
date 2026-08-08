# docs/ — local reference material

Nothing in this folder is deployed; it exists so that you (and any AI coding
assistant working in this repo) can answer platform questions without leaving the
project.

- [tgcloud-sdk.md](tgcloud-sdk.md) — the full SDK reference, scaffolded by
  `npm create @tgcloud/bot`: every column type and query-builder method of `db`,
  how `api.*` calls and `BotApiError` behave, the `fetch` client, and `console`
  logging. When a query or API call surprises you, look here first.

Related reading elsewhere in the repo:

- [../README.md](../README.md) — the platform's main principles and how this
  template demonstrates them.
- [../AGENTS.md](../AGENTS.md) — the condensed "rules that bite", auto-loaded by
  Claude Code, Cursor, and similar tools.
- [Telegram Serverless announcement page](https://core.telegram.org/bots/serverless)
  and the [Bot API reference](https://core.telegram.org/bots/api) — the upstream
  sources.
