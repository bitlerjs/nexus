import { createDatabase, createMigration, FeatureExtractor } from '@bitlerjs/nexus-data';

const EXTRACTOR_MODEL = 'mixedbread-ai/mxbai-embed-large-v1';

const addMessagesTable = createMigration({
  name: 'add-messages-table',
  up: async (knex, { container }) => {
    const featureExtractor = container.get(FeatureExtractor);
    const embeddingField = await featureExtractor.getFieldType(EXTRACTOR_MODEL);
    await knex.schema.createTable('messages', (table) => {
      table.string('id').primary();
      table.string('senderId').notNullable();
      table.string('recipientId').notNullable();
      table.string('groupId').nullable();
      table.boolean('isMe').nullable();
      table.specificType('embedding', embeddingField).notNullable();
      table.string('notificationId').nullable();
      table.datetime('timestamp').defaultTo(knex.fn.now());
    });
  },
  down: async (knex) => {
    await knex.schema.dropTable('messages');
  },
});

const dbConfig = createDatabase({
  name: 'signal',
  migrations: [addMessagesTable],
});

type MessageRow = {
  id: string;
  senderId: string;
  recipientId: string;
  groupId?: string;
  isMe?: boolean;
  embedding: number[];
  notificationId?: string;
  timestamp: Date;
};

export { dbConfig, type MessageRow, EXTRACTOR_MODEL };
