import { Type } from '@bitlerjs/nexus';
import { createConfig } from '@bitlerjs/nexus-configs';
const linearConfig = createConfig({
  kind: 'linear',
  schema: Type.Object({
    apiKey: Type.String(),
  }),
});

export { linearConfig };
