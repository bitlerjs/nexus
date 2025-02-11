import { createExtension, TasksService, EventsService } from '@bitlerjs/nexus';

import { TimerService } from './service/service.js';
import { timerCreatedEvent } from './events/events.created.js';
import { timerTriggeredEvent } from './events/events.triggered.js';
import { timerUpdatedEvent } from './events/events.updated.js';
import { addTimerTask } from './tasks/tasks.add.js';
import { removeTimerTask } from './tasks/tasks.remove.js';
import { listTimersTask } from './tasks/tasks.list.js';

const timers = createExtension({
  setup: async ({ container }) => {
    const service = container.get(TimerService);
    await service.start();

    const eventsService = container.get(EventsService);
    eventsService.register([timerCreatedEvent, timerTriggeredEvent, timerUpdatedEvent]);

    const tasksService = container.get(TasksService);
    tasksService.register([addTimerTask, removeTimerTask, listTimersTask]);
  },
});

const events = {
  timerCreated: timerCreatedEvent,
  timerTriggered: timerTriggeredEvent,
  timerUpdated: timerUpdatedEvent,
};

const tasks = {
  addTimer: addTimerTask,
  removeTimer: removeTimerTask,
  listTimers: listTimersTask,
};

export { timers, events, tasks };
