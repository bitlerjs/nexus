import { createEvent, Type } from '@bitlerjs/nexus';

const timerCreatedEvent = createEvent({
  kind: 'timer.created',
  name: 'Timer Created',
  description: 'A timer was created',
  input: Type.Object({}),
  output: Type.Object({
    id: Type.String(),
    description: Type.Optional(Type.String()),
    duration: Type.Number(),
  }),
});

export { timerCreatedEvent };
