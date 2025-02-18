import { createExtension, EventsService, TasksService } from '@bitlerjs/nexus';

import { notificationRemovedEvent } from './events/events.removed.js';
import { notificationCreatedEvent } from './events/events.created.js';
import { addNotificationTask } from './tasks/tasks.add.js';
import { listNotificationTask } from './tasks/tasks.list.js';
import { removeNotificationsTask } from './tasks/tasks.remove.js';
import { runNotificationActionTask } from './tasks/tasks.run-action.js';

const tasks = {
  addNotification: addNotificationTask,
  listNotifications: listNotificationTask,
  removeNotifications: removeNotificationsTask,
  runNotificationAction: runNotificationActionTask,
};

const events = [notificationRemovedEvent, notificationCreatedEvent];
const notifications = createExtension({
  setup: async ({ container }) => {
    const tasksService = container.get(TasksService);
    tasksService.register(Object.values(tasks));

    const eventsService = container.get(EventsService);
    eventsService.register(Object.values(events));
  },
});

export { notifications, tasks, events };
