import { createEntityProvider, Static, Type } from '@bitlerjs/nexus';
import { Databases, FeatureExtractor } from '@bitlerjs/nexus-data';

import { dbConfig, EXTRACTOR_MODEL, MessageRow } from '../databases/databases.js';

const messageSchema = Type.Object({
  id: Type.String(),
  timestamp: Type.String({
    format: 'date-time',
  }),
  sender: Type.Object({
    id: Type.String(),
    name: Type.Optional(Type.String()),
    isMe: Type.Boolean(),
  }),
  recipient: Type.Object({
    id: Type.String(),
    name: Type.Optional(Type.String()),
    isMe: Type.Boolean(),
  }),
  group: Type.Optional(
    Type.Object({
      id: Type.String(),
      name: Type.String(),
    }),
  ),
  content: Type.Object({
    format: Type.String(),
    text: Type.String(),
  }),
  distance: Type.Optional(Type.Number()),
});

type Message = Static<typeof messageSchema>;

const map = (row: MessageRow): Message => ({
  id: row.id,
  timestamp: row.timestamp.toISOString(),
  sender: {
    id: row.senderId,
    isMe: row.isMe ?? false,
  },
  recipient: {
    id: row.recipientId,
    isMe: !row?.isMe,
  },
  group: row.groupId
    ? {
        id: row.groupId,
        name: 'TODO',
      }
    : undefined,
  content: {
    format: 'text',
    text: 'TODO',
  },
});

const messageEntity = createEntityProvider({
  kind: 'signal.message',
  name: 'Signal Message',
  description: 'A message send or recieved through Signal',
  schema: messageSchema,
  get: async ({ input, container }) => {
    const dbs = container.get(Databases);
    const db = await dbs.get(dbConfig);

    const rows = await db<MessageRow>('messages').whereIn('id', input.ids);
    return rows.map(map);
  },
  find: {
    schema: Type.Object({
      limit: Type.Optional(Type.Number()),
      offset: Type.Optional(Type.Number()),
      ids: Type.Optional(Type.Array(Type.String())),
      senderId: Type.Optional(Type.String()),
      recipientId: Type.Optional(Type.String()),
      groupId: Type.Optional(Type.String()),
      semanticText: Type.Optional(Type.String()),
    }),
    handler: async ({ input, container }) => {
      const dbs = container.get(Databases);
      const db = await dbs.get(dbConfig);

      let query = db<MessageRow & { distance?: number }>('messages');
      if (input.semanticText) {
        const featureExtractor = container.get(FeatureExtractor);
        const [vector] = await featureExtractor.extract({
          model: EXTRACTOR_MODEL,
          input: [input.semanticText],
        });
        query = query.select(['messages.*', db.raw(`embedding <-> '${vector.toSql()}' as distance`)]);
        query = query.orderByRaw(`embedding <-> '${vector.toSql()}'`);
      }

      if (input.ids) {
        query = query.whereIn('id', input.ids);
      }
      if (input.senderId) {
        query = query.where('senderId', input.senderId);
      }
      if (input.recipientId) {
        query = query.where('recipientId', input.recipientId);
      }
      if (input.groupId) {
        query = query.where('groupId', input.groupId);
      }
      if (input.limit) {
        query = query.limit(input.limit);
      }
      if (input.offset) {
        query = query.offset(input.offset);
      }

      const rows = await query;
      return rows.map(map);
    },
  },
});

export { messageEntity, type Message };
