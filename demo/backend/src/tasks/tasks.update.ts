import { createTask } from '@bitlerjs/nexus';
import { Databases, FeatureExtractor } from '@bitlerjs/nexus-data';
import { EventsService } from '@bitlerjs/nexus/dist/events/events.js';

import { MODEL } from '../consts.js';
import { todoSchema, todoUpdateSchema } from '../schemas/schemas.js';
import { dbConfig } from '../database/database.js';
import { updatedEvent } from '../events/events.updated.js';

const updateTodoTask = createTask({
  kind: 'todo.update',
  name: 'Update todo',
  description: 'Update a todo',
  input: todoUpdateSchema,
  output: todoSchema,
  handler: async ({ input: { id, ...input }, container }) => {
    const dbs = container.get(Databases);
    const db = await dbs.get(dbConfig);
    const featureExtractor = container.get(FeatureExtractor);
    const [vector] = await featureExtractor.extract({
      input: [[input.title, input.description].filter(Boolean).join(' ')],
      model: MODEL,
    });
    const data = {
      ...input,
      embedding: vector.toSql(),
      updatedAt: new Date(),
      completedAt: input.completedAt ? new Date(input.completedAt) : input.completedAt,
      deletedAt: input.deletedAt ? new Date(input.deletedAt) : input.deletedAt,
    };

    await db('todos').update(data).where('id', id);
    const [row] = await db('todos').where('id', id);
    const result = {
      ...row,
      description: row.description || undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      completedAt: row.completedAt?.toISOString(),
      deletedAt: row.deletedAt?.toISOString(),
    };
    const eventsService = container.get(EventsService);
    eventsService.emit(updatedEvent, {
      ...result,
      action: 'update',
    });
    return result;
  },
});

export { updateTodoTask };
