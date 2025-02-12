import { createTask, Type } from '@bitlerjs/nexus';

import { ConfigService } from '../service/service.js';

const listConfigTypes = createTask({
  kind: 'configs.list',
  name: 'List Config Types',
  group: 'Configs',
  description: 'List all the config types in the system',
  input: Type.Object({}),
  output: Type.Array(
    Type.Object({
      kind: Type.String(),
      name: Type.Optional(Type.String()),
      description: Type.Optional(Type.String()),
      hasValue: Type.Boolean(),
    }),
  ),
  handler: async ({ container }) => {
    const configsServoce = container.get(ConfigService);
    return await configsServoce.list();
  },
});

export { listConfigTypes };
