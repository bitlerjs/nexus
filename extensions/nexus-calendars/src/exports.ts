import { createExtension, TasksService } from '@bitlerjs/nexus';
import { ConfigService } from '@bitlerjs/nexus-configs';

import { calendarConfig } from './config/config.js';
import { findEventsTask } from './tasks/tasks.find.js';

const calendars = createExtension({
  setup: async ({ container }) => {
    const configsService = container.get(ConfigService);
    configsService.register([calendarConfig]);

    configsService.use({
      config: calendarConfig,
      handler: async (config) => {
        const tasksService = container.get(TasksService);
        if (config) {
          tasksService.register([findEventsTask]);
        } else {
          tasksService.unregister([findEventsTask]);
        }
      },
    });
  },
});

export { calendars };
