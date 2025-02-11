import { createTask, Type } from '@bitlerjs/nexus';

import { ConfigService } from '../exports.js';

const describeConfigType = createTask({
  kind: 'configs.describe',
  name: 'Describe a config type',
  group: 'Configs',
  description: 'Describe a config type',
  input: Type.Object({
    kind: Type.String(),
  }),
  output: Type.Object({
    kind: Type.String(),
    name: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    schema: Type.Unknown(),
  }),
  handler: async ({ container, input }) => {
    const configsServoce = container.get(ConfigService);
    const config = configsServoce.get(input.kind);
    if (!config) {
      throw new Error(`Config type ${input.kind} not found`);
    }
    return config;
  },
});

export { describeConfigType };
