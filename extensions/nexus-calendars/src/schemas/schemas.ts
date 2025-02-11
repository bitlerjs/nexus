import { Type } from '@bitlerjs/nexus';

const eventSchema = Type.Object({
  dates: Type.Array(
    Type.Object({
      start: Type.Date(),
      end: Type.Date(),
    }),
  ),
  uuid: Type.Optional(Type.String()),
  datetype: Type.Optional(Type.Union([Type.Literal('date-time'), Type.Literal('date')])),
  location: Type.Optional(Type.String()),
  status: Type.Optional(Type.String()),
  summary: Type.String(),
  description: Type.Optional(Type.String()),
  attendees: Type.Optional(
    Type.Array(
      Type.Object({
        name: Type.Optional(Type.String()),
        type: Type.Optional(Type.String()),
        state: Type.Optional(Type.String()),
      }),
    ),
  ),
});

export { eventSchema };
