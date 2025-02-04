import { createEvent, Type } from '@bitlerjs/nexus';

import { todoSchema } from '../schemas/schemas.js';

const updatedEvent = createEvent({
  kind: 'todo.updated',
  name: 'Todo Updated',
  description: 'This event is emitted when a todo is updated.',
  input: Type.Object({
    ids: Type.Optional(Type.Array(Type.String())),
  }),
  output: Type.Union([
    Type.Composite([
      todoSchema,
      Type.Object({
        action: Type.Union([Type.Literal('create'), Type.Literal('update')]),
      }),
    ]),
    Type.Object({
      id: Type.String(),
      action: Type.Literal('delete'),
    }),
  ]),
  filter: async ({ event, input }) => {
    if (!input.ids) {
      return true;
    }
    return input.ids.includes(event.id);
  },
});

export { updatedEvent };
