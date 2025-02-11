import { Type } from '@sinclair/typebox';

import { createTask, Task, TasksService } from '../tasks/tasks.js';
import { Container } from '../container/container.js';

import { EntityProvider } from './entities.provider.js';

type EntityProviderConfig = {
  provider: EntityProvider;
  tasks: Task[];
};

class EntityProvidersService {
  #container: Container;
  #entityProviders: Map<string, EntityProviderConfig>;

  constructor(container: Container) {
    this.#container = container;
    this.#entityProviders = new Map();
  }

  public register = (providers: EntityProvider<any, any, any, any>[]) => {
    const tasksService = this.#container.get(TasksService);
    providers.forEach((provider) => {
      if (this.#entityProviders.has(provider.kind)) {
        return;
      }
      const tasks: Task<any, any>[] = [];
      tasks.push(
        createTask({
          kind: `${provider.kind}.find`,
          name: `Get ${provider.name} entities`,
          group: 'Entities',
          description: `Get ${provider.name} entities`,
          input: Type.Object({
            ids: Type.Array(Type.String()),
          }),
          output: Type.Array(provider.schema),
          handler: provider.get,
        }),
      );

      if (provider.find) {
        tasks.push(
          createTask({
            kind: `${provider.kind}.find`,
            name: `Find ${provider.name} entities`,
            group: 'Entities',
            description: `Find ${provider.name} entities`,
            input: provider.find.schema,
            output: Type.Array(provider.schema),
            handler: provider.find.handler,
          }),
        );
      }

      if (provider.create) {
        tasks.push(
          createTask({
            kind: `${provider.kind}.create`,
            name: `Create a ${provider.name} entitiy`,
            group: 'Entities',
            description: `Create a ${provider.name} entity`,
            input: provider.create.schema,
            output: Type.Object({
              id: Type.String(),
            }),
            handler: async (...args) => {
              const id = await provider.create?.handler(...args);
              if (!id) {
                throw new Error('Failed to create entity');
              }
              return { id };
            },
          }),
        );
      }

      if (provider.update) {
        tasks.push(
          createTask({
            kind: `${provider.kind}.update`,
            name: `Update a ${provider.name} entitiy`,
            group: 'Entities',
            description: `Update a ${provider.name} entity`,
            input: provider.update.schema,
            output: Type.Object({
              success: Type.Boolean(),
            }),
            handler: async (...args) => {
              await provider.update?.handler(...args);
              return {
                success: true,
              };
            },
          }),
        );
      }

      if (provider.delete) {
        tasks.push(
          createTask({
            kind: `${provider.kind}.delete`,
            name: `Delete ${provider.name} entities`,
            group: 'Entities',
            description: `Delete ${provider.name} entities`,
            input: Type.Object({
              ids: Type.Array(Type.String()),
            }),
            output: Type.Object({
              success: Type.Boolean(),
            }),
            handler: async (...args) => {
              await provider.delete?.handler(...args);
              return {
                success: true,
              };
            },
          }),
        );
      }

      if (tasks.length > 0) {
        tasksService.register(tasks);
      }

      this.#entityProviders.set(provider.kind, {
        provider,
        tasks,
      });
    });
  };

  public list = () => {
    return Array.from(this.#entityProviders.values()).map((config) => config.provider);
  };
}

export * from './entities.provider.js';
export { EntityProvidersService };
