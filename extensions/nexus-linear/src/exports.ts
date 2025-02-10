import { createExtension, TasksService } from '@bitlerjs/nexus';

import { LinearService } from './services/services.token.js';
import { getByIdTask } from './tasks/tasks.get-by-id.js';
import { assignedIssuesTask } from './tasks/tasks.assigned-issues.js';
import { getBySprintTask } from './tasks/tasks.get-by-sprint.js';
import { whoAmITask } from './tasks/tasks.who-am-i.js';

type Config = {
  apiKey: string;
};

const linear = createExtension<Config>({
  setup: async ({ container, config }) => {
    const tasksService = container.get(TasksService);
    const linearService = container.get(LinearService);
    linearService.token = config.apiKey;
    tasksService.register([getByIdTask, assignedIssuesTask, getBySprintTask, whoAmITask]);
  },
});

export { linear };
