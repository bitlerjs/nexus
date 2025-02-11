import { createDatabase, createMigration } from '@bitlerjs/nexus-data';

const init = createMigration({
  name: 'init',
  up: async (knex) => {
    await knex.schema.createTable('timers', (table) => {
      table.string('id').primary();
      table.string('owner').nullable();
      table.string('description').nullable();
      table.integer('duration').notNullable();
      table.dateTime('start').notNullable();
    });
  },
  down: async (knex) => {
    await knex.schema.dropTable('timers');
  },
});

const dbConfig = createDatabase({
  name: 'timers',
  migrations: [init],
});

export { dbConfig };
