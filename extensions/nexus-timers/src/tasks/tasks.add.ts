import { createTask, Type } from '@bitlerjs/nexus';

import { TimerService } from '../service/service.js';
import { addTimerSchema } from '../schemas/schemas.js';

const addTimerTask = createTask({
  kind: 'timers.add',
  name: 'Add Timer',
  group: 'Timers',
  description: 'Add a timer',
  input: addTimerSchema,
  output: Type.Object({
    id: Type.String({
      description: 'ID of the timer',
    }),
  }),
  handler: async ({ container, input }) => {
    const service = container.get(TimerService);
    const result = await service.addTimer(input);
    return result;
  },
});

export { addTimerTask };
