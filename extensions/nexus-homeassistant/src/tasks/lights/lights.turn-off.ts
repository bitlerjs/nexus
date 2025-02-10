import { createTask, Type } from '@bitlerjs/nexus';

import { HomeassistantService } from '../../services/services.ha.js';

const turnOff = createTask({
  kind: `homeassistant.lights.turn-off`,
  name: 'Turn off lights',
  description: 'Turn off the lights',
  input: Type.Object({
    rooms: Type.Array(
      Type.String({
        description: 'The room ids to turn off the lights in (allows multiple rooms)',
      }),
    ),
    transition: Type.Optional(
      Type.Number({
        description: 'The duration in seconds to transition to the new state',
      }),
    ),
  }),
  output: Type.Object({
    success: Type.Boolean(),
  }),
  handler: async ({ input, container }) => {
    const ha = container.get(HomeassistantService);
    await ha.ready();
    const allRooms = await ha.getRoomsConfig();
    const selectedRooms = allRooms.filter((room) => input.rooms.includes(room.id));
    const roomIds = selectedRooms.flatMap((room) => {
      if (!room || !room.lightGroup) {
        return [];
      }
      return [room.lightGroup];
    });
    if (roomIds.length === 0) {
      throw new Error('No lights found in the rooms');
    }
    await ha.callService({
      domain: 'light',
      service: 'turn_off',
      serviceData: {
        entity_id: roomIds,
        transition: input.transition,
      },
    });
    return {
      success: true,
    };
  },
});

export { turnOff };
