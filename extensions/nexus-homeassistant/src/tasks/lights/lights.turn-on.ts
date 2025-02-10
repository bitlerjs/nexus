import { createTask, Type } from '@bitlerjs/nexus';

import { HomeassistantService } from '../../services/services.ha.js';

const turnOn = createTask({
  kind: `homeassistant.lights.turn-on`,
  name: 'Turn on lights',
  description: 'Turn on the lights',
  input: Type.Object({
    rooms: Type.Array(
      Type.String({
        description: 'The room ids to turn on the lights in (allows multiple rooms)',
      }),
    ),
    brightness: Type.Optional(
      Type.Number({
        description:
          'Number indicating the percentage of full brightness, where 0 turns the light off, 1 is the minimum brightness, and 100 is the maximum brightness.',
      }),
    ),
    brightnessStep: Type.Optional(
      Type.Number({
        description: 'Change brightness by a percentage.',
      }),
    ),
    temperature: Type.Optional(Type.Number({ description: 'light temperature in kelvin' })),
    color: Type.Optional(
      Type.Object(
        {
          r: Type.Number(),
          g: Type.Number(),
          b: Type.Number(),
        },
        {
          description:
            'The color in RGB format. A list of three integers between 0 and 255 representing the values of red, green, and blue',
        },
      ),
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
      service: 'turn_on',
      serviceData: {
        entity_id: roomIds,
        brightness_pct: input.brightness,
        brightness_step_pct: input.brightnessStep,
        rgb_color: input.color ? [input.color.r, input.color.g, input.color.b] : undefined,
        kelvin: input.temperature,
      },
    });
    return {
      success: true,
    };
  },
});

export { turnOn };
