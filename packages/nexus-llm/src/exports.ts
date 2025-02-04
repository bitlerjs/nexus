import { createExtension, TasksService } from '@bitlerjs/nexus';

import { completionTask } from './tasks/tasks.completion.js';
import { listModelsTask } from './tasks/tasks.list-models.js';
import { ModelsService } from './services/services.model.js';

type Config = {
  defaultModel: string;
};
const llmExtension = createExtension<Config>({
  setup: async ({ container, config }) => {
    const tasksService = container.get(TasksService);
    const modelsService = container.get(ModelsService);
    tasksService.register([listModelsTask, completionTask]);
    modelsService.defaultModel = config.defaultModel;
  },
});

export * from './tasks/tasks.completion.js';
export * from './schemas/schemas.completion.js';
export * from './services/services.model.js';
export * from './tasks/tasks.list-models.js';

export { llmExtension };
