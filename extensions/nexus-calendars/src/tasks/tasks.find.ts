import { createTask, Type } from '@bitlerjs/nexus';

import { Calendars } from '../service/service.js';
import { parseEvents } from '../utils/utils.parser.js';
import { eventSchema } from '../schemas/schemas.js';

const findEventsTask = createTask({
  kind: 'calendar.get-events',
  name: 'Get Events',
  group: 'Calendar',
  description: 'Get events from calendars',
  input: Type.Object({
    from: Type.Optional(
      Type.String({
        format: 'date-time',
      }),
    ),
    to: Type.Optional(
      Type.String({
        format: 'date-time',
      }),
    ),
  }),
  output: Type.Array(eventSchema),
  handler: async ({ container, input }) => {
    const calendarServices = container.get(Calendars);
    const from = input.from ? new Date(input.from) : new Date();
    const to = input.to ? new Date(input.to) : new Date(new Date().setDate(new Date().getDate() + 1));
    const objs = await calendarServices.getEvents(from, to);
    const events = parseEvents({
      objs,
      from,
      to,
    });
    return events;
  },
});

export { findEventsTask };
