import { createExtension, TasksService } from '@bitlerjs/nexus';
import { ConfigService } from '@bitlerjs/nexus-configs';

import { tasks } from './tasks/tasks.js';
import { HomeassistantService } from './services/services.ha.js';
import { homeassistantConfig } from './configs/configs.js';

type Config = {
  url?: string;
  token?: string;
};

const homeassistant = createExtension<Config>({
  setup: async ({ container, config }) => {
    const tasksService = container.get(TasksService);
    const ha = container.get(HomeassistantService);

    if (!config.url || !config.token) {
      const configsService = container.get(ConfigService);
      configsService.register([homeassistantConfig]);
      configsService.use({
        config: homeassistantConfig,
        handler: async (config) => {
          if (config) {
            ha.setAuth(config.url, config.token);
            tasksService.register([...Object.values(tasks.lights), ...Object.values(tasks.config)]);
          } else {
            ha.deauth();
            tasksService.unregister([...Object.values(tasks.lights), ...Object.values(tasks.config)]);
          }
        },
      });
    } else {
      ha.setAuth(config.url, config.token);
      tasksService.register([...Object.values(tasks.lights), ...Object.values(tasks.config)]);
    }
  },
});

export { homeassistant, tasks, HomeassistantService };
