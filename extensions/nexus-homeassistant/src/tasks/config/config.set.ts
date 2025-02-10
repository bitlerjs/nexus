import { createTask, Type } from '@bitlerjs/nexus';

import { roomConfigSchema } from '../../schemas/rooms.js';
import { HomeassistantService } from '../../homeassistant.js';

const set = createTask({
  kind: `homeassistant.setup.set-config`,
  name: 'Set home assistant room config',
  description: 'Set the configuration for the home assistant integration',
  input: Type.Object({
    rooms: Type.Array(roomConfigSchema),
  }),
  output: Type.Object({
    success: Type.Boolean(),
  }),
  handler: async ({ input, container }) => {
    const haService = container.get(HomeassistantService);
    await haService.setRoomsConfig(input.rooms);

    return {
      success: true,
    };
  },
});

export { set };
