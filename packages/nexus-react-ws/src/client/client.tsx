import {} from '@tanstack/react-query';

import { createMutationHooks } from './client.mutation.js';
import { createQueryHooks } from './client.query.js';
import { createEventHooks } from './client.event.js';
import { type ServerDefinition } from '@bitlerjs/nexus-client-ws';

const createTypedHooks = <T extends ServerDefinition>() => {
  const queryhooks = createQueryHooks<T>();
  const mutationHooks = createMutationHooks<T>();
  const eventHooks = createEventHooks<T>();
  return {
    ...queryhooks,
    ...mutationHooks,
    ...eventHooks,
  };
};

export * from './client.event.js';
export * from './client.mutation.js';
export * from './client.query.js';
export { createTypedHooks };
