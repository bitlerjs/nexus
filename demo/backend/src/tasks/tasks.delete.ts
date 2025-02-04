import { createTask, Type } from '@bitlerjs/nexus';
import { Databases } from '@bitlerjs/nexus-data';
import { EventsService } from '@bitlerjs/nexus/dist/events/events.js';

import { dbConfig } from '../database/database.js';
import { updatedEvent } from '../events/events.updated.js';

const deleteTodoTask = createTask({
  kind: 'todo.delete',
  name: 'Delete todos',
  description: 'Delete todos',
  input: Type.Object({
    ids: Type.Array(Type.String()),
  }),
  output: Type.Object({
    success: Type.Boolean(),
  }),
  handler: async ({ input, container }) => {
    const dbs = container.get(Databases);
    const db = await dbs.get(dbConfig);

    await db('todos').delete().whereIn('id', input.ids);
    const eventsService = container.get(EventsService);
    for (const id of input.ids) {
      eventsService.emit(updatedEvent, {
        id,
        action: 'delete',
      });
    }
    return { success: true };
  },
});

export { deleteTodoTask };
