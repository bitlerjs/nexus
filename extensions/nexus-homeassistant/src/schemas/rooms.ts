import { Static, Type } from '@bitlerjs/nexus';

const roomConfigSchema = Type.Object({
  id: Type.String(),
  names: Type.Array(Type.String()),
  mediaPlayers: Type.Optional(Type.Array(Type.String())),
  lightGroup: Type.Optional(Type.String()),
  lights: Type.Optional(
    Type.Array(
      Type.Object({
        id: Type.String(),
        name: Type.Optional(Type.String()),
      }),
    ),
  ),
});

type RoomConfig = Static<typeof roomConfigSchema>;

export { roomConfigSchema, type RoomConfig };
