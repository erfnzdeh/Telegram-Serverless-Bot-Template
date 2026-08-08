import { table, integer, text, boolean, index, sql } from 'sdk/db';

// Database tables as named exports. Deploying this file registers the schema;
// run `npx tgcloud migrate` afterwards to apply the changes to the database.
//
// NOTE: foreign keys are not supported on this platform — `todos.chatId` is a
// logical link only. Enforce integrity in application code (see lib/todos).

export const users = table('users', {
  tgId:    integer('tg_id').primaryKey(),
  name:    text('name').notNull(),
  lang:    text('lang').default('en'),
  created: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const todos = table('todos', {
  id:      integer('id').primaryKey({ autoIncrement: true }),
  chatId:  integer('chat_id').notNull(),
  text:    text('text').notNull(),
  done:    boolean('done').notNull().default(false),
  created: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (t) => ({
  chatDoneIdx: index('idx_todos_chat_done').on(t.chatId, t.done),
}));
