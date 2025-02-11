import { createDatabase, createMigration } from '@bitlerjs/nexus-data';

const init = createMigration({
  name: 'init',
  up: async (knex) => {
    await knex.schema.createTable('configs', (table) => {
      table.string('kind').primary();
      table.json('data');
    });
  },
  down: async (knex) => {
    await knex.schema.dropTable('configs');
  },
});

const dbConfig = createDatabase({
  name: 'configs',
  migrations: [init],
});

type ConfigRow = {
  kind: string;
  data: unknown;
};

export { dbConfig, type ConfigRow };
