import { Type } from '@bitlerjs/nexus';
import { createConfig } from '@bitlerjs/nexus-configs';

const createOpenAiConfig = (kind?: string) =>
  createConfig({
    kind: `openai.${kind || 'default'}`,
    name: kind ? `OpenAI Config (${kind})` : 'OpenAI Config',
    description: 'Configuration for OpenAI compatible API',
    schema: Type.Object({
      api: Type.Object({
        url: Type.Optional(Type.String()),
        key: Type.String(),
      }),
      models: Type.Optional(Type.Record(Type.String(), Type.String())),
    }),
  });

export { createOpenAiConfig };
