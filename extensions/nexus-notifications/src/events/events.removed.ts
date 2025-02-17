import { createEvent, Type } from '@bitlerjs/nexus';

const notificationRemovedEvent = createEvent({
  kind: 'notification.removed',
  name: 'Notification Removed',
  description: 'A notification was removed',
  input: Type.Object({
    ids: Type.Optional(Type.Array(Type.String())),
  }),
  output: Type.Object({
    id: Type.String(),
  }),
  filter: async ({ input, event }) => {
    return input.ids?.includes(event.id) || false;
  },
});

export { notificationRemovedEvent };
