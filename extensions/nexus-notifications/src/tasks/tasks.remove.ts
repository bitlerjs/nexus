import { createTask, EventsService, Type } from '@bitlerjs/nexus';
import { Databases } from '@bitlerjs/nexus-data';

import { dbConfig } from '../databases/databases.js';
import { notificationRemovedEvent } from '../events/events.removed.js';

const removeNotificationsTask = createTask({
  kind: 'notification.remove',
  name: 'Remove',
  group: 'Notification',
  description: 'Remove a notification',
  input: Type.Object({
    ids: Type.Array(Type.String()),
  }),
  output: Type.Object({
    success: Type.Boolean(),
  }),
  handler: async ({ input, container }) => {
    const dbs = container.get(Databases);
    const eventsService = container.get(EventsService);
    const db = await dbs.get(dbConfig);

    await db.transaction(async (trx) => {
      await trx('notifications').whereIn('id', input.ids).delete();
    });

    input.ids.forEach((id) => {
      eventsService.emit(notificationRemovedEvent, { id });
    });

    return { success: true };
  },
});

export { removeNotificationsTask };
