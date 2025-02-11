import { createEvent, Type } from '@bitlerjs/nexus';

const timerUpdatedEvent = createEvent({
  kind: 'timer.updated',
  name: 'Timer updated',
  description: 'A timer was updated',
  input: Type.Object({}),
  output: Type.Object({
    id: Type.String(),
    description: Type.Optional(Type.String()),
    duration: Type.Number(),
    action: Type.Union([Type.Literal('created'), Type.Literal('updated'), Type.Literal('removed')]),
  }),
});

export { timerUpdatedEvent };
