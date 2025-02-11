import { createTask, Type } from '@bitlerjs/nexus';

import { TimerService } from '../service/service.js';
import { timerSchema } from '../schemas/schemas.js';

const listTimersTask = createTask({
  kind: 'timers.list',
  name: 'List Timers',
  group: 'Timers',
  description: 'List all timers',
  input: Type.Object({}),
  output: Type.Object({
    timers: Type.Array(timerSchema),
  }),
  handler: async ({ container }) => {
    const service = container.get(TimerService);
    const result = await service.listTimers();
    return { timers: result };
  },
});

export { listTimersTask };
