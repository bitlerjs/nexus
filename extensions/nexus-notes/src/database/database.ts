import { createDatabase, createMigration, FeatureExtractor } from '@bitlerjs/nexus-data';

const EXTRACTOR_MODEL = 'mixedbread-ai/mxbai-embed-large-v1';

const init = createMigration({
  name: 'init',
  up: async (knex, { container }) => {
    const featureExtractor = container.get(FeatureExtractor);
    const embeddingField = await featureExtractor.getFieldType(EXTRACTOR_MODEL);
    await knex.schema.createTable('notes', (table) => {
      table.string('id').primary();
      table.string('path').nullable();
      table.string('title').notNullable();
      table.text('content').notNullable();
      table.specificType('embedding', embeddingField).notNullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      table.timestamp('deletedAt').nullable();
      table.index('path');
    });

    await knex.schema.createTable('note_relations', (table) => {
      table.string('noteId').notNullable().references('notes.id').onDelete('CASCADE');
      table.string('kind').notNullable();
      table.string('id').notNullable();
      table.primary(['noteId', 'kind', 'id']);
      table.index(['noteId']);
      table.index(['kind', 'id']);
    });
  },
  down: async (knex) => {
    await knex.schema.dropTable('note_relations');
    await knex.schema.dropTable('notes');
  },
});

const dbConfig = createDatabase({
  name: 'notes',
  migrations: [init],
});

type NoteRow = {
  id: string;
  path?: string;
  title: string;
  content: string;
  embedding: number[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export { dbConfig, type NoteRow, EXTRACTOR_MODEL };
