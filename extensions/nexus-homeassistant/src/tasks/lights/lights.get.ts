import { createTask, Type } from '@bitlerjs/nexus';

import { HomeassistantService } from '../../services/services.ha.js';
import { roomsBootstrap } from '../../bootstrap/bootstrap.rooms.js';

const lightState = Type.Object({
  on: Type.Boolean(),
  brightnessPct: Type.Optional(Type.Number()),
  rgb: Type.Optional(
    Type.Object({
      r: Type.Number(),
      g: Type.Number(),
      b: Type.Number(),
    }),
  ),
  colorTempKelvin: Type.Optional(Type.Number()),
});

const get = createTask({
  kind: `homeassistant.lights.get`,
  name: 'Get light status',
  description: 'Get the status of the lights in a room',
  bootstrap: [roomsBootstrap],
  input: Type.Object({
    rooms: Type.Array(
      Type.String({
        description: 'The room ids to turn off the lights in (allows multiple rooms)',
      }),
    ),
  }),
  output: Type.Object({
    rooms: Type.Array(
      Type.Object({
        id: Type.String(),
        all: Type.Optional(lightState),
      }),
    ),
  }),
  handler: async ({ input, container }) => {
    const ha = container.get(HomeassistantService);
    await ha.ready();
    const allRooms = await ha.getRoomsConfig();

    const roomsInfo = allRooms.filter((room) => input.rooms.includes(room.id));

    const rooms = roomsInfo.flatMap((roomInfo) => {
      if (!roomInfo) {
        return [];
      }

      const allEntity = roomInfo.lightGroup ? ha.entities[roomInfo.lightGroup] : undefined;
      const room = {
        id: roomInfo.id,
        all: allEntity?.attributes
          ? {
            on: allEntity.attributes.brightness > 0,
            brightnessPct: (allEntity.attributes.brightness || 0) / 2.55,
            rgb: allEntity.attributes.rgb_color
              ? {
                r: allEntity.attributes.rgb_color[0],
                g: allEntity.attributes.rgb_color[1],
                b: allEntity.attributes.rgb_color[2],
              }
              : undefined,
            colorTempKelvin: allEntity.attributes.color_temp_kelvin || undefined,
          }
          : undefined,
      };
      return [room];
    });

    return {
      rooms,
    };
  },
});

export { get };
