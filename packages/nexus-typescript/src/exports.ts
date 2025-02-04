import { createExtension, TasksService } from '@bitlerjs/nexus';

import { executeTypeScriptTask } from './tasks/tasks.execute.js';
import { addTypescriptModuleTask } from './tasks/tasks.add-module.js';
import { listTypescriptModulesTask } from './tasks/tasks.list-modules.js';

const typescript = createExtension({
  setup: async ({ container }) => {
    const tasksService = container.get(TasksService);
    tasksService.register([executeTypeScriptTask, addTypescriptModuleTask, listTypescriptModulesTask]);
  },
});

export { typescript };
