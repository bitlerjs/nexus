import { Type } from '@bitlerjs/nexus';
import { createTask } from '@bitlerjs/nexus/dist/tasks/tasks.task.js';

import { ModelsService } from '../services/services.model.js';

const listModelsTask = createTask({
  kind: 'llm.list-models',
  name: 'List LLM Models',
  description: 'List all models registered with LLM',
  input: Type.Object({}),
  output: Type.Array(
    Type.Object({
      kind: Type.String(),
      name: Type.String(),
      provider: Type.String(),
    }),
  ),
  handler: async ({ container }) => {
    const modelsService = container.get(ModelsService);
    return modelsService.list();
  },
});

export { listModelsTask };
