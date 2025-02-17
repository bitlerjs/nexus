import { createEvent, Type } from '@bitlerjs/nexus';

const notificationCreatedEvent = createEvent({
  kind: 'notification.created',
  name: 'Notification created',
  description: 'A notification was created',
  input: Type.Object({}),
  output: Type.Object({
    id: Type.String(),
    title: Type.String(),
    message: Type.String(),
    entities: Type.Array(
      Type.Object({
        kind: Type.String(),
        id: Type.String(),
        role: Type.Optional(Type.String()),
      }),
    ),
    actions: Type.Array(
      Type.Object({
        id: Type.String(),
        title: Type.String(),
        description: Type.Optional(Type.String()),
      }),
    ),
  }),
});

export { notificationCreatedEvent };
