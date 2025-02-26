import { createDatabase, createMigration, FeatureExtractor } from '@bitlerjs/nexus-data';

const EXTRACTOR_MODEL = 'mixedbread-ai/mxbai-embed-large-v1';

const init = createMigration({
  name: 'init',
  up: async (knex, { container }) => {
    const featureExtractor = container.get(FeatureExtractor);
    const embeddingField = await featureExtractor.getFieldType(EXTRACTOR_MODEL);
    await knex.schema.createTable('documents', (table) => {
      table.string('id').primary();
      table.string('entityKind').notNullable();
      table.string('entityId').notNullable();
      table.specificType('embedding', embeddingField).notNullable();
      table.string('context').notNullable();
    });
  },
  down: async (knex) => {
    await knex.schema.dropTable('documents');
  },
});

const dbConfig = createDatabase({
  name: 'knowledge-base',
  migrations: [init],
});

type DocumentRow = {
  id: string;
  entityKind: string;
  entityId: string;
  embedding: number[];
  context: string;
};

export { dbConfig, type DocumentRow, EXTRACTOR_MODEL };
