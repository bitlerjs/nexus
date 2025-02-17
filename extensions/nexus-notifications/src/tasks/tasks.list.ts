import { createTask, Type } from '@bitlerjs/nexus';
import { Databases } from '@bitlerjs/nexus-data';

import { dbConfig } from '../databases/databases.js';

const listNotificationTask = createTask({
  kind: 'notification.list',
  name: 'List',
  group: 'Notification',
  description: 'List notifications',
  input: Type.Object({}),
  output: Type.Object({
    notifications: Type.Array(
      Type.Object({
        id: Type.String(),
        title: Type.String(),
        message: Type.String(),
        createdAt: Type.String(),
        actions: Type.Array(
          Type.Object({
            id: Type.String(),
            title: Type.String(),
            description: Type.Optional(Type.String()),
            kind: Type.String(),
            removeNotification: Type.Optional(Type.Boolean()),
            data: Type.Unknown(),
          }),
        ),
      }),
    ),
  }),
  handler: async ({ container }) => {
    const dbs = container.get(Databases);
    const db = await dbs.get(dbConfig);

    const notifications = await db('notifications').select('*');
    const actions = await db('notificationActions').select('*');

    const result = notifications.map((notification) => ({
      ...notification,
      actions: actions.filter((action) => action.notificationId === notification.id),
    }));

    return { notifications: result };
  },
});

export { listNotificationTask };
