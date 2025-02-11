import { createEvent, Type } from '@bitlerjs/nexus';

const configUpdatedEvent = createEvent({
  kind: 'configs.updated',
  name: 'Config updated',
  description: 'Emitted when a config is updated',
  input: Type.Object({
    kinds: Type.Optional(Type.Array(Type.String())),
  }),
  output: Type.Object({
    kind: Type.String(),
    value: Type.Unknown(),
  }),
});

export { configUpdatedEvent };
