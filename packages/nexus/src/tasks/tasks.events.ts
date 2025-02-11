import { Type } from '@sinclair/typebox';

import { createEvent } from '../events/events.js';

const tasksUpdated = createEvent({
  kind: 'tasks.updated',
  name: 'Tasks Updated',
  description: 'Fired when tasks are updated',
  input: Type.Object({}),
  output: Type.Object({}),
});

export { tasksUpdated };
