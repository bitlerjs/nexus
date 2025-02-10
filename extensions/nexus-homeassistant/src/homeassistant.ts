import { createExtension, TasksService } from '@bitlerjs/nexus';

import { tasks } from './tasks/tasks.js';
import { HomeassistantService } from './services/services.ha.js';

type Config = {
  url: string;
  token: string;
};

const homeassistant = createExtension<Config>({
  setup: async ({ container, config }) => {
    const tasksService = container.get(TasksService);
    const ha = container.get(HomeassistantService);
    ha.setAuth(config.url, config.token);

    tasksService.register([...Object.values(tasks.lights), ...Object.values(tasks.config)]);
  },
});

export { homeassistant, tasks, HomeassistantService };
