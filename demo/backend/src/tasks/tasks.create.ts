import { createTask } from '@bitlerjs/nexus';
import { Databases, FeatureExtractor } from '@bitlerjs/nexus-data';
import { EventsService } from '@bitlerjs/nexus/dist/events/events.js';

import { MODEL } from '../consts.js';
import { todoCreateSchema, todoSchema } from '../schemas/schemas.js';
import { dbConfig } from '../database/database.js';
import { updatedEvent } from '../events/events.updated.js';

const createTodoTask = createTask({
  kind: 'todo.create',
  name: 'Create todo',
  description: 'Create a new todo',
  input: todoCreateSchema,
  output: todoSchema,
  handler: async ({ input, container }) => {
    const dbs = container.get(Databases);
    const db = await dbs.get(dbConfig);
    const id = Math.random().toString(36).substring(7);
    const featureExtractor = container.get(FeatureExtractor);
    const [vector] = await featureExtractor.extract({
      input: [[input.title, input.description].filter(Boolean).join(' ')],
      model: MODEL,
    });
    const data = {
      ...input,
      id,
      embedding: vector.toSql(),
      updatedAt: new Date(),
    };

    await db('todos').insert(data);
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
      action: 'create',
    });
    return result;
  },
});

export { createTodoTask };
