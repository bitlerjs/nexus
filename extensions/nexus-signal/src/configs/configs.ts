import { Type } from '@bitlerjs/nexus';
import { createConfig } from '@bitlerjs/nexus-configs';

const signalConfig = createConfig({
  kind: 'signal.integration',
  name: 'Signal',
  group: 'Integrations',
  description: 'Signal integration',
  schema: Type.Object({
    host: Type.String(),
    secure: Type.Boolean(),
  }),
});

export { signalConfig };
