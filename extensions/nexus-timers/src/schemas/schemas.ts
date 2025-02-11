import { Type } from '@bitlerjs/nexus';

const addTimerSchema = Type.Object({
  duration: Type.Number({
    description: 'Duration in seconds',
  }),
  description: Type.Optional(
    Type.String({
      description: 'Description of the timer',
    }),
  ),
});

const timerSchema = Type.Object({
  id: Type.String({
    description: 'ID of the timer',
  }),
  description: Type.Optional(
    Type.String({
      description: 'Description of the timer',
    }),
  ),
  duration: Type.Number({
    description: 'Duration in seconds',
  }),
  start: Type.String({
    description: 'Start time of the timer',
    format: 'date-time',
  }),
});

export { addTimerSchema, timerSchema };
