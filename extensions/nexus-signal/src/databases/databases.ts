import { createDatabase, createMigration } from '@bitlerjs/nexus-data';

const addNotificationsTable = createMigration({
  name: 'add-notifications-table',
  up: async (knex) => {
    await knex.schema.createTable('notifications', (table) => {
      table.increments('id');
      table.string('senderUuid');
      table.string('notificationId');
      table.datetime('timestamp').defaultTo(knex.fn.now());
    });
  },
  down: async (knex) => {
    await knex.schema.dropTable('notifications');
  },
});

const dbConfig = createDatabase({
  name: 'signal',
  migrations: [addNotificationsTable],
});

export { dbConfig };
