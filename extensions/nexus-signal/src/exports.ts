import { createExtension, TasksService } from '@bitlerjs/nexus';
import { ConfigService } from '@bitlerjs/nexus-configs';

import { SignalService } from './services/services.signal.js';
import { signalConfig } from './configs/configs.js';
import { getContactsTask } from './tasks/tasks.get-contacts.js';
import { getGroupsTask } from './tasks/tasks.get-groups.js';
import { sendTask } from './tasks/tasks.send.js';

const signal = createExtension({
  setup: async ({ container }) => {
    const configsService = container.get(ConfigService);
    const tasksService = container.get(TasksService);

    configsService.register([signalConfig]);

    configsService.use({
      config: signalConfig,
      handler: async (config) => {
        if (config) {
          const signalService = container.get(SignalService);
          await signalService.setup();
          tasksService.register([getContactsTask, getGroupsTask, sendTask]);
        }
      },
    });
  },
});

export { signal };
