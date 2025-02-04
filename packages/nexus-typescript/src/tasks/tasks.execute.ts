import { createTask, Type } from '@bitlerjs/nexus';

import { TypeScriptService } from '../services/services.typescript.js';

const executeTypeScriptTask = createTask({
  kind: 'typescript.execute',
  name: 'Execute TypeScript code',
  description: 'Execute TypeScript code',
  input: Type.Object({
    code: Type.String({
      description: 'TypeScript code to execute in esm format (use export default to return a value)',
    }),
    allowModules: Type.Optional(Type.Array(Type.String())),
  }),
  output: Type.Object({
    result: Type.Unknown(),
  }),
  handler: async ({ input, container }) => {
    const typescriptService = container.get(TypeScriptService);
    return typescriptService.execute(input);
  },
});

export { executeTypeScriptTask };
