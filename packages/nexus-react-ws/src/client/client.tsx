import {} from '@tanstack/react-query';

import { createMutationHooks } from './client.mutation.js';
import { createQueryHooks } from './client.query.js';
import { createEventHooks } from './client.event.js';
import { type ServerDefinition } from '@bitlerjs/nexus-client-ws';
import { createEntityByIdHooks } from './client.entities-by-id.js';
import { createFindEntitiesMutation } from './client.find-entities.js';
import { createCreateEntityMutationHooks } from './client.create-entity.js';
import { createUpdateEntityMutationHooks } from './client.update-entity.js';

const createTypedHooks = <T extends ServerDefinition>() => {
  const queryhooks = createQueryHooks<T>();
  const mutationHooks = createMutationHooks<T>();
  const eventHooks = createEventHooks<T>();
  const entitiesByIdHooks = createEntityByIdHooks<T>();
  const findEntitiesQueryHooks = createFindEntitiesMutation<T>();
  const createEntityHooks = createCreateEntityMutationHooks<T>();
  const updateEntityHooks = createUpdateEntityMutationHooks<T>();
  return {
    ...queryhooks,
    ...mutationHooks,
    ...eventHooks,
    ...entitiesByIdHooks,
    ...findEntitiesQueryHooks,
    ...createEntityHooks,
    ...updateEntityHooks,
  };
};

export * from './client.event.js';
export * from './client.mutation.js';
export * from './client.query.js';
export * from './client.entities-by-id.js';
export * from './client.find-entities.js';
export * from './client.create-entity.js';
export * from './client.update-entity.js';

export { createTypedHooks };
