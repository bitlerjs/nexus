import { createMigration } from '@bitlerjs/nexus-data';

const init = createMigration({
  name: 'init',
  up: async (knex) => {
    await knex.schema.createTable('rooms', (table) => {
      table.string('id').primary();
      table.string('lightGroup').nullable();
    });

    await knex.schema.createTable('media_players', (table) => {
      table.string('entityId').notNullable();
      table.string('roomId').notNullable().references('rooms.id').onDelete('CASCADE');
      table.primary(['entityId', 'roomId']);
    });

    await knex.schema.createTable('lights', (table) => {
      table.string('entityId').notNullable();
      table.string('name').nullable();
      table.string('roomId').notNullable().references('rooms.id').onDelete('CASCADE');
      table.primary(['entityId', 'roomId']);
    });

    await knex.schema.createTable('room_names', (table) => {
      table.string('room_id').references('rooms.id').onDelete('CASCADE');
      table.string('name');
      table.primary(['room_id', 'name']);
    });
  },
  down: async (knex) => {
    await knex.schema.dropTable('media_players');
    await knex.schema.dropTable('room_names');
    await knex.schema.dropTable('rooms');
  },
});
const migrations = [init];

export { migrations };
