import { EventsService, Type, createTask } from '@bitlerjs/nexus';
import { nanoid } from 'nanoid';
import { Databases } from '@bitlerjs/nexus-data';

import { dbConfig } from '../databases/databases.js';
import { notificationCreatedEvent } from '../events/events.created.js';

const addNotificationTask = createTask({
  kind: 'notification.add',
  name: 'Add notification',
  description: 'Add a notification',
  input: Type.Object({
    id: Type.Optional(Type.String()),
    title: Type.String(),
    message: Type.String(),
    entities: Type.Optional(
      Type.Array(
        Type.Object({
          kind: Type.String(),
          id: Type.String(),
          rolw: Type.Optional(Type.String()),
        }),
      ),
    ),
    actions: Type.Optional(
      Type.Array(
        Type.Object({
          title: Type.String(),
          description: Type.Optional(Type.String()),
          kind: Type.String(),
          removeNotification: Type.Optional(Type.Boolean()),
          data: Type.Unknown(),
        }),
      ),
    ),
  }),
  output: Type.Object({
    id: Type.String(),
  }),
  handler: async ({ input, container }) => {
    const dbs = container.get(Databases);
    const eventsService = container.get(EventsService);
    const db = await dbs.get(dbConfig);
    const id = input.id || nanoid();
    const actions = input.actions?.map((action) => ({
      id,
      title: action.title,
      description: action.description,
      kind: action.kind,
      removeNotification: action.removeNotification || false,
      data: action.data,
    }));

    await db.transaction(async (trx) => {
      await trx('notifications')
        .insert({
          id,
          title: input.title,
          message: input.message,
        })
        .onConflict('id')
        .merge();

      await trx('notificationActions').where('notificationId', id).delete();
      await trx('notificationEntities').where('notificationId', id).delete();

      if (actions) {
        await trx('notificationActions').insert(actions);
      }

      if (input.entities) {
        await trx('notificationEntities').insert(input.entities.map((entity) => ({ ...entity, notificationId: id })));
      }
    });

    eventsService.emit(notificationCreatedEvent, {
      id,
      title: input.title,
      message: input.message,
      actions: actions || [],
      entities: input.entities || [],
    });

    return { id };
  },
});

export { addNotificationTask };
