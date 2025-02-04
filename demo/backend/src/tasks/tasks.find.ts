import { createTask, Type } from '@bitlerjs/nexus';
import { Databases, FeatureExtractor } from '@bitlerjs/nexus-data';

import { todoSchema } from '../schemas/schemas.js';
import { dbConfig } from '../database/database.js';
import { MODEL } from '../consts.js';

const findTodosTask = createTask({
  kind: 'todo.list',
  name: 'List todos',
  description: 'Get a list of todos',
  input: Type.Object({
    text: Type.Optional(Type.String()),
    completed: Type.Optional(Type.Boolean()),
    offset: Type.Optional(Type.Number()),
    limit: Type.Optional(Type.Number()),
  }),
  output: Type.Array(
    Type.Composite([
      todoSchema,
      Type.Object({
        distance: Type.Optional(Type.Number()),
      }),
    ]),
  ),
  handler: async ({ input, container }) => {
    const dbs = container.get(Databases);
    const db = await dbs.get(dbConfig);

    let query = db('todos');

    const defaultColumns = ['id', 'title', 'description', 'createdAt', 'updatedAt', 'deletedAt', 'completedAt'];

    if (input.text) {
      const featureExtractor = container.get(FeatureExtractor);
      const [vector] = await featureExtractor.extract({
        input: [input.text],
        model: MODEL,
      });
      query = query
        .select([...defaultColumns, db.raw(`embedding <-> '${vector.toSql()}' as distance`)])
        .orderByRaw(`embedding <-> '${vector.toSql()}'`);
    } else {
      query = query.select(defaultColumns).orderBy('createdAt');
    }
    if (input.completed === true) {
      query = query.whereNotNull('completedAt');
    } else if (input.completed === false) {
      query = query.whereNull('completedAt');
    }
    if (input.offset) {
      query = query.offset(input.offset);
    }
    if (input.limit) {
      query = query.limit(input.limit);
    }
    const results = await query.whereNull('deletedAt');

    return results.map((row) => ({
      ...row,
      description: row.description || undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      completedAt: row.completedAt?.toISOString(),
      deletedAt: row.deletedAt?.toISOString(),
    }));
  },
});

export { findTodosTask };
