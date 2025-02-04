import { createExtension, TasksService } from '@bitlerjs/nexus';
import { EventsService } from '@bitlerjs/nexus/dist/events/events.js';

import { findTodosTask } from './tasks/tasks.find.js';
import { updatedEvent } from './events/events.updated.js';
import { createTodoTask } from './tasks/tasks.create.js';
import { updateTodoTask } from './tasks/tasks.update.js';
import { deleteTodoTask } from './tasks/tasks.delete.js';

const todos = createExtension({
  setup: async ({ container }) => {
    const tasksService = container.get(TasksService);
    const eventsService = container.get(EventsService);

    tasksService.register([createTodoTask, updateTodoTask, deleteTodoTask, findTodosTask]);
    eventsService.register([updatedEvent]);
  },
});

export { todos };
