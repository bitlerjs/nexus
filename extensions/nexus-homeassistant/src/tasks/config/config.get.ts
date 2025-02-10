import { createTask, Type } from '@bitlerjs/nexus';

import { roomConfigSchema } from '../../schemas/rooms.js';
import { HomeassistantService } from '../../homeassistant.js';

const get = createTask({
  kind: `homeassistant.setup.get-config`,
  name: 'Get home assistant room config',
  description: 'Get the configuration for the home assistant integration',
  input: Type.Object({}),
  output: Type.Object({
    rooms: Type.Array(roomConfigSchema),
  }),
  handler: async ({ container }) => {
    const haService = container.get(HomeassistantService);
    return {
      rooms: await haService.getRoomsConfig(),
    };
  },
});

export { get };
