import { createTask, Type } from '@bitlerjs/nexus';

import { ConfigService } from '../service/service.js';

const setConfigValueTask = createTask({
  kind: 'configs.set-value',
  name: 'Set config value',
  group: 'Configs',
  description: 'Set the value of a config',
  input: Type.Object({
    kind: Type.String(),
    value: Type.Unknown(),
  }),
  output: Type.Object({
    success: Type.Boolean(),
  }),
  handler: async ({ container, input }) => {
    const configsServoce = container.get(ConfigService);
    const config = configsServoce.get(input.kind);
    if (!config) {
      throw new Error(`Config with kind ${input.kind} not found`);
    }
    await configsServoce.setValue(config, input.value);
    return { success: true };
  },
});

export { setConfigValueTask };
