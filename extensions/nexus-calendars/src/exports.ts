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
        if (!config) {
          return;
        }
        const tasksService = container.get(TasksService);
        tasksService.register([findEventsTask]);
      },
    });
  },
});

export { calendars };
