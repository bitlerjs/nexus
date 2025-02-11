import { Type } from '@bitlerjs/nexus';
import { createConfig } from '@bitlerjs/nexus-configs';

const homeassistantConfig = createConfig({
  kind: 'homeassistant',
  schema: Type.Object({
    url: Type.String(),
    token: Type.String(),
  }),
});

export { homeassistantConfig };
