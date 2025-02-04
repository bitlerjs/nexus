import { resolve } from 'path';

import { generateSpecs } from '@bitlerjs/nexus';
import { generateTypeFile } from '@bitlerjs/nexus-client/generate';
import { completionTask, listModelsTask } from '@bitlerjs/nexus-llm';

const specs = generateSpecs({
  tasks: [completionTask, listModelsTask],
  entities: [],
  sources: [],
  events: [],
});

await generateTypeFile({
  specs,
  location: resolve(import.meta.dirname, '../generated/server.ts'),
});
