import { createEvent, Type } from '@bitlerjs/nexus';

const timerTriggeredEvent = createEvent({
  kind: 'timer.triggered',
  name: 'Timer Triggered',
  description: 'A timer was triggered',
  input: Type.Object({}),
  output: Type.Object({
    id: Type.String(),
    description: Type.Optional(Type.String()),
    duration: Type.Number(),
  }),
});

export { timerTriggeredEvent };
