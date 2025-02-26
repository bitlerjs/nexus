import { createExtension, TasksService } from '@bitlerjs/nexus';

import { searchTask } from './tasks/tasks.search.js';

const knowledgeBase = createExtension({
  setup: async ({ container }) => {
    const tasksService = container.get(TasksService);
    tasksService.register([searchTask]);
  },
});

export { KnowledgeBaseService } from './service/service.js';
export { knowledgeBase };
