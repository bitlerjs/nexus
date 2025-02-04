import { createTask, Type } from '@bitlerjs/nexus';

import { TypeScriptService } from '../services/services.typescript.js';

const addTypescriptModuleTask = createTask({
  kind: 'typescript.add-module',
  name: 'Add module',
  description: 'Add a TypeScript module',
  input: Type.Object({
    id: Type.String(),
    name: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    code: Type.String(),
    allowModules: Type.Optional(Type.Array(Type.String())),
  }),
  output: Type.Object({
    success: Type.Boolean(),
  }),
  handler: async ({ container, input }) => {
    const typescriptService = container.get(TypeScriptService);
    typescriptService.registerModules({
      [input.id]: () => {
        const { result } = typescriptService.execute({
          code: input.code,
          allowModules: input.allowModules,
        });
        return result;
      },
    });
    return {
      success: true,
    };
  },
});

export { addTypescriptModuleTask };
