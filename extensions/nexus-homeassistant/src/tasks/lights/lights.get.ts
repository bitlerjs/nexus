import { createTask, Type } from '@bitlerjs/nexus';

import { HomeassistantService } from '../../services/services.ha.js';

const get = createTask({
  kind: `homeassistant.lights.get`,
  name: 'Get light status',
  description: 'Get the status of the lights in a room',
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
        all: Type.Any(),
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
        all: allEntity?.attributes,
      };
      return [room];
    });

    return {
      rooms,
    };
  },
});

export { get };
