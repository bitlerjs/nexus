import { createTask, Type } from '@bitlerjs/nexus';

import { ConfigService } from '../exports.js';

const removeConfigValueTask = createTask({
  kind: 'configs.remove-value',
  name: 'Remove config value',
  group: 'Configs',
  description: 'Remove the value of a config',
  input: Type.Object({
    kind: Type.String(),
  }),
  output: Type.Object({
    success: Type.Boolean(),
  }),
  handler: async ({ container, input }) => {
    const configsServoce = container.get(ConfigService);
    await configsServoce.removeValue(input.kind);
    return { success: true };
  },
});

export { removeConfigValueTask };
