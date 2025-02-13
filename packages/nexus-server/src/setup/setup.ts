import { type Task, type Extension, Container, TasksService, ExtensionsService } from '@bitlerjs/nexus';
import { FastifyInstance } from 'fastify';

import { ServerService } from '../server/server.js';

type Setup = {
  port?: number;
  host?: string;
  container?: Container;
  tasks?: Task[];
  oidc?: {
    issuerUrl: string;
    clientId?: string;
    audience?: string;
  };
  extensions?: [Extension<any>, unknown][];
  onServerSetup?: (app: FastifyInstance) => Promise<void>;
  onReady?: (container: Container) => Promise<void> | void;
};

const setup = async (options: Setup) => {
  const container = options.container ?? new Container();
  if (options.tasks) {
    const tasksService = container.get(TasksService);
    tasksService.register(options.tasks);
  }
  if (options.extensions) {
    const extensionsService = container.get(ExtensionsService);
    for (const [extension, config] of options.extensions) {
      await extensionsService.register(extension, config);
    }
  }
  await options.onReady?.(container);
  const serverService = container.get(ServerService);
  const server = await serverService.create({
    setup: options.onServerSetup,
    oidc: options.oidc,
  });
  await server.listen({
    port: options.port || 4000,
    host: options.host,
  });
};

function defineConfig(setup: Setup) {
  return setup;
}

function defineExtension<T>(extension: Extension<T>, config: T): [Extension<T>, T] {
  return [extension, config];
}

export { setup, defineConfig, defineExtension, type Setup };
