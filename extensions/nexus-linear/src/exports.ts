import { createExtension, EntityProvidersService, TasksService } from '@bitlerjs/nexus';
import { ConfigService } from '@bitlerjs/nexus-configs';

import { LinearService } from './services/services.token.js';
import { assignedIssuesTask } from './tasks/tasks.assigned-issues.js';
import { getBySprintTask } from './tasks/tasks.get-by-sprint.js';
import { whoAmITask } from './tasks/tasks.who-am-i.js';
import { linearIssueEntity } from './entities/entities.issue.js';
import { linearConfig } from './configs/configs.js';

type Config = {
  apiKey?: string;
};

const linear = createExtension<Config>({
  setup: async ({ container, config }) => {
    const tasksService = container.get(TasksService);
    const entityProviderService = container.get(EntityProvidersService);
    const linearService = container.get(LinearService);

    if (config.apiKey) {
      linearService.token = config.apiKey;
      tasksService.register([assignedIssuesTask, getBySprintTask, whoAmITask]);
      entityProviderService.register([linearIssueEntity]);
    } else {
      const configsService = container.get(ConfigService);
      configsService.register([linearConfig]);
      configsService.use({
        config: linearConfig,
        handler: async (config) => {
          if (config) {
            linearService.token = config.apiKey;
            tasksService.register([assignedIssuesTask, getBySprintTask, whoAmITask]);
            entityProviderService.register([linearIssueEntity]);
          } else {
            linearService.token = undefined;
            tasksService.unregister([assignedIssuesTask, getBySprintTask, whoAmITask]);
          }
        },
      });
    }
  },
});

export { linear };
