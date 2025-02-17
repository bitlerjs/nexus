import { createDatabase, createMigration } from '@bitlerjs/nexus-data';

const init = createMigration({
  name: 'init',
  up: async (knex) => {
    await knex.schema.createTable('notifications', (table) => {
      table.string('id').primary();
      table.string('title').notNullable();
      table.string('message').notNullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
    });

    await knex.schema.createTable('notificationActions', (table) => {
      table.string('id').primary();
      table.string('title').notNullable();
      table.string('description').nullable();
      table.string('notificationId').notNullable().references('id').inTable('notifications').onDelete('CASCADE');
      table.string('kind').notNullable();
      table.boolean('removeNotification').defaultTo(false);
      table.json('data').notNullable();
    });

    await knex.schema.createTable('notificationEntities', (table) => {
      table.string('notificationId').notNullable().references('id').inTable('notifications').onDelete('CASCADE');
      table.string('kind').notNullable();
      table.string('role').nullable();
      table.string('entityId').notNullable();
      table.primary(['notificationId', 'kind', 'entityId']);
    });
  },
  down: async (knex) => {
    await knex.schema.dropTable('notificationEntities');
    await knex.schema.dropTable('notificationActions');
    await knex.schema.dropTable('notifications');
  },
});

const dbConfig = createDatabase({
  name: 'notifications',
  migrations: [init],
});

export { dbConfig };
