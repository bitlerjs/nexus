import { createTask, Type } from '@bitlerjs/nexus';

import { TypeScriptService } from '../services/services.typescript.js';

const listTypescriptModulesTask = createTask({
  kind: 'typescript.list-modules',
  name: 'List modules',
  description: 'List TypeScript modules',
  input: Type.Object({}),
  output: Type.Array(Type.String()),
  handler: async ({ container }) => {
    const typescriptService = container.get(TypeScriptService);
    const modules = typescriptService.listModules();
    return modules;
  },
});

export { listTypescriptModulesTask };
