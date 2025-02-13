import 'dotenv/config';
import { defineConfig, defineExtension } from '@bitlerjs/nexus-studio';
import { llmExtension } from '@bitlerjs/nexus-llm';
import { openai } from '@bitlerjs/nexus-openai';
import { typescript } from '@bitlerjs/nexus-typescript';
import { linear } from '@bitlerjs/nexus-linear';
import { homeassistant } from '@bitlerjs/nexus-homeassistant';
import { notes } from '@bitlerjs/nexus-notes';
import { timers } from '@bitlerjs/nexus-timers';

import { todos } from './src/extension.js';

const config = defineConfig({
  oidc: process.env.OIDC_ISSUER_URL
    ? {
        issuerUrl: process.env.OIDC_ISSUER_URL,
        clientId: process.env.OIDC_CLIENT_ID,
      }
    : undefined,
  extensions: [
    defineExtension(todos, {}),
    defineExtension(typescript, {}),
    defineExtension(llmExtension, {
      defaultModel: 'openai.gpt-4o-mini',
    }),
    defineExtension(linear, {}),
    defineExtension(openai, {
      kind: 'openai',
      models: {
        'gpt-4o-mini': 'GPT-4o-Mini',
        'gpt-4': 'GPT-4',
        'o1-mini': 'o1-mini',
        'o3-mini': 'o3-mini',
      },
    }),
    defineExtension(openai, {
      kind: 'ollama',
    }),
    defineExtension(homeassistant, {}),
    defineExtension(notes, {}),
    defineExtension(timers, {}),
  ],
});

export { config };
