import { createEntityProvider } from '@bitlerjs/nexus';

import { todoSchema } from '../schemas/schemas.js';

const todoEntity = createEntityProvider({
  kind: 'todo',
  name: 'Todo item',
  description: 'A todo item',
  schema: todoSchema,
  get: async () => {},
});

export { todoEntity };
