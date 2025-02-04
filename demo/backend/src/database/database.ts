import { createDatabase, createMigration, FeatureExtractor } from '@bitlerjs/nexus-data';

import { MODEL } from '../consts.js';

const init = createMigration({
  name: 'init',
  up: async (knex, { container }) => {
    const featureExtractor = container.get(FeatureExtractor);
    const embeddedField = await featureExtractor.getFieldType(MODEL);
    await knex.schema.createTable('todos', (table) => {
      table.string('id').primary();
      table.string('title').notNullable();
      table.text('description').nullable();
      table.specificType('embedding', embeddedField).notNullable();
      table.dateTime('createdAt').defaultTo(knex.fn.now());
      table.dateTime('updatedAt').defaultTo(knex.fn.now());
      table.dateTime('deletedAt').nullable();
      table.dateTime('completedAt').nullable();
    });
  },
  down: async (knex) => {
    await knex.schema.dropTable('todos');
  },
});

const dbConfig = createDatabase({
  name: 'todos',
  migrations: [init],
});

export { dbConfig };
