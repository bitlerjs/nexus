import { resolve } from 'path';

import { generateSpecs } from '@bitlerjs/nexus';
import { generateTypeFile } from '@bitlerjs/nexus-client/generate';
import { completionTask, listModelsTask } from '@bitlerjs/nexus-llm';
import {
  listConfigTypes,
  setConfigValueTask,
  getConfigValueTask,
  configTypesUpdated,
  describeConfigType,
  removeConfigValueTask,
} from '@bitlerjs/nexus-configs';

const specs = generateSpecs({
  tasks: [
    completionTask,
    listModelsTask,
    listConfigTypes,
    setConfigValueTask,
    getConfigValueTask,
    describeConfigType,
    removeConfigValueTask,
  ],
  entities: [],
  sources: [],
  events: [configTypesUpdated],
});

await generateTypeFile({
  specs,
  location: resolve(import.meta.dirname, '../generated/server.ts'),
});
