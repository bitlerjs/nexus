import { createExtension } from '@bitlerjs/nexus';
import { ConfigService } from '@bitlerjs/nexus-configs';
import { ModelsService, type ModelDefinition } from '@bitlerjs/nexus-llm';
import OpenAI from 'openai';

import { createOpenAiConfig } from './config/config.js';

type Model = OpenAI.ChatCompletionCreateParams.ChatCompletionCreateParamsNonStreaming['model'];

type Config =
  | {
      kind: string;
      models?: Partial<Record<Model, string>>;
    }
  | {
      kind: string;
      api: {
        url?: string;
        key: string;
      };
      models: Partial<Record<Model, string>>;
    };
const openai = createExtension<Config>({
  setup: async ({ config, container }) => {
    const modelsService = container.get(ModelsService);
    if ('api' in config && 'models' in config) {
      const models = Object.entries(config.models).map<ModelDefinition>(([model, name]) => ({
        kind: `openai.${model}`,
        name: name || 'unknown',
        model,
        api: {
          key: config.api.key,
          url: config.api.url,
        },
        provider: config.kind,
      }));
      modelsService.register(models);
    } else {
      const configService = container.get(ConfigService);
      const configItem = createOpenAiConfig(config.kind);
      configService.register([configItem]);
      configService.use({
        config: configItem,
        handler: (current) => {
          modelsService.removeProvider(config.kind);
          if (current) {
            const modelObj = current.models || config.models || {};
            const models = Object.entries(modelObj).map<ModelDefinition>(([model, name]) => ({
              kind: `openai.${model}`,
              name: name || 'unknown',
              model,
              api: {
                key: current.api.key,
                url: current.api.url,
              },
              provider: config.kind,
            }));
            modelsService.register(models);
          }
        },
      });
    }
  },
});

export { openai };
