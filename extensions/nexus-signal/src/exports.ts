import { createExtension, EntityProvidersService, TasksService } from '@bitlerjs/nexus';
import { ConfigService } from '@bitlerjs/nexus-configs';

import { SignalService } from './services/services.signal.js';
import { signalConfig } from './configs/configs.js';
import { sendTask } from './tasks/tasks.send.js';
import { signalGroup } from './entities/group.js';
import { signalContact } from './entities/contact.js';

const signal = createExtension({
  setup: async ({ container }) => {
    const configsService = container.get(ConfigService);
    const tasksService = container.get(TasksService);
    const entityProviderService = container.get(EntityProvidersService);

    configsService.register([signalConfig]);

    configsService.use({
      config: signalConfig,
      handler: async (config) => {
        const signalService = container.get(SignalService);
        if (config) {
          await signalService.destroy();
          signalService.config = config;
          await signalService.setup();
          tasksService.register([sendTask]);
          entityProviderService.register([signalGroup, signalContact]);
        } else {
          tasksService.unregister([sendTask]);
          await signalService.destroy();
          entityProviderService.unregister([signalGroup, signalContact]);
        }
      },
    });
  },
});

export { signal };
