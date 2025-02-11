import { createEvent, Type } from '@bitlerjs/nexus';

const configTypesUpdated = createEvent({
  kind: 'configs.types-updated',
  name: 'Config types added',
  description: 'Emitted when a config type is added',
  input: Type.Object({}),
  output: Type.Object({
    kinds: Type.Array(Type.String()),
  }),
});

export { configTypesUpdated };
