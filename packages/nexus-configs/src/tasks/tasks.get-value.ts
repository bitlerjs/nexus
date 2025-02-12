import { createTask, Type } from '@bitlerjs/nexus';

import { ConfigService } from '../service/service.js';

const getConfigValueTask = createTask({
  kind: 'configs.get-value',
  name: 'Get config value',
  group: 'Configs',
  description: 'Get the value of a config',
  input: Type.Object({
    kind: Type.String(),
  }),
  output: Type.Unknown(),
  handler: async ({ container, input }) => {
    const configsServoce = container.get(ConfigService);
    const config = configsServoce.get(input.kind);
    if (!config) {
      return undefined;
    }
    const value = await configsServoce.getValue(config);
    return value;
  },
});

export { getConfigValueTask };
