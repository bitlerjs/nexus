import { Type } from '@sinclair/typebox';

import { createTask } from './tasks.task.js';
import { TasksService } from './tasks.js';

const listTasksTask = createTask({
  kind: 'core.list-tasks',
  name: 'List tasks',
  description: 'List all tasks',
  input: Type.Object({}),
  output: Type.Array(
    Type.Object({
      name: Type.String(),
      description: Type.String(),
      kind: Type.String(),
    }),
  ),
  handler: async ({ container }) => {
    const tasksService = container.get(TasksService);
    return tasksService.list();
  },
});

export { listTasksTask };
