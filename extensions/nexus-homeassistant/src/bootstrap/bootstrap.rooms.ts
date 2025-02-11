import { createBootstrapItem, Type } from '@bitlerjs/nexus';

import { roomConfigSchema } from '../schemas/rooms.js';
import { HomeassistantService } from '../homeassistant.js';

const roomsBootstrap = createBootstrapItem({
  kind: 'homeassistant.rooms',
  name: 'Homeassistant rooms',
  description: 'Bootstrap Homeassistant room config',
  schema: Type.Array(roomConfigSchema),
  handler: async ({ container }) => {
    const haService = container.get(HomeassistantService);
    return await haService.getRoomsConfig();
  },
});

export { roomsBootstrap };
