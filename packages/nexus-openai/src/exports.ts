import { createExtension } from '@bitlerjs/nexus';
import { ModelsService, type ModelDefinition } from '@bitlerjs/nexus-llm';
import OpenAI from 'openai';

type Model = OpenAI.ChatCompletionCreateParams.ChatCompletionCreateParamsNonStreaming['model'];

type Config = {
  url?: string;
  apiKey: string;
  models: Partial<Record<Model, string>>;
};
const openai = createExtension<Config>({
  setup: async ({ config, container }) => {
    const modelsService = container.get(ModelsService);
    const models = Object.entries(config.models).map<ModelDefinition>(([name, model]) => ({
      kind: `openai.${name}`,
      name,
      model: model!,
      api: {
        key: config.apiKey,
        url: config.url,
      },
      provider: 'OpenAI',
    }));
    modelsService.register(models);
  },
});

export { openai };
