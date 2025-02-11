import { createTask, Type } from '@bitlerjs/nexus';

import { TimerService } from '../service/service.js';

const removeTimerTask = createTask({
  kind: 'timers.remove',
  name: 'Remove Timer',
  group: 'Timers',
  description: 'Remove a timer by ID',
  input: Type.Object({
    id: Type.String(),
  }),
  output: Type.Object({
    success: Type.Boolean(),
  }),
  handler: async ({ container, input }) => {
    const service = container.get(TimerService);
    await service.removeTimer(input.id);
    return { success: true };
  },
});

export { removeTimerTask };
