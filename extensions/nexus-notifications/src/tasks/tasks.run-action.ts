import { createTask, TasksService, Type } from '@bitlerjs/nexus';
import { Databases } from '@bitlerjs/nexus-data';

import { dbConfig } from '../databases/databases.js';

const runNotificationActionTask = createTask({
  kind: 'notification.run-action',
  name: 'Run Action',
  group: 'Notification',
  description: 'Run a notification action',
  input: Type.Object({
    actionId: Type.String(),
  }),
  output: Type.Object({
    actionId: Type.String(),
    notificationId: Type.String(),
    success: Type.Boolean(),
  }),
  handler: async ({ input, container, requestContext, continuation }) => {
    const dbs = container.get(Databases);
    const db = await dbs.get(dbConfig);

    const [action] = await db('notificationActions').select('*').where('id', input.actionId).limit(1);
    if (!action) {
      throw new Error('Action not found');
    }
    const tasksService = container.get(TasksService);
    const task = tasksService.get(action.kind);
    if (!task) {
      throw new Error('Task not found');
    }
    await tasksService.run({
      task,
      input: action.data,
      requestContext,
      continuation,
    });

    if (action.removeNotification) {
      await db('notifications').where('id', action.notificationId).delete();
    }

    return {
      success: true,
      actionId: action.id,
      notificationId: action.notificationId,
    };
  },
});

export { runNotificationActionTask };
