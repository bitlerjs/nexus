import { Container, Continuation, createExtension, RequestContext, TasksService, Type } from '@bitlerjs/nexus';
import { createTask } from '@bitlerjs/nexus/dist/tasks/tasks.task.js';

import { getApiDefintion } from './utils/openapi.js';

type HeaderOptions = {
  container: Container;
  requestContext: RequestContext;
  continuation: Continuation;
};

type Config = {
  kind: string;
  schemaUrl: string;
  serverUrl: string;
  headers?: (options: HeaderOptions) => Promise<Record<string, string>>;
};
const openApi = createExtension<Config>({
  setup: async ({ config, container }) => {
    const taskService = container.get(TasksService);

    const { endpoints } = await getApiDefintion(config.schemaUrl);

    const tasks = endpoints.map((endpoint) => {
      return createTask({
        kind: `api.${config.kind}.${endpoint.method}.${endpoint.path}`,
        name: endpoint.name,
        description: endpoint.description,
        input: Type.Object({
          ...endpoint.input,
        }),
        output: Type.Unsafe(endpoint.output),
        handler: async ({ input, requestContext, container, continuation }) => {
          const url = new URL(endpoint.path, config.serverUrl);
          for (const [key, value] of Object.entries(input.query || {})) {
            url.searchParams.append(key, String(value));
          }
          for (const [key, value] of Object.entries(input.path || {})) {
            url.pathname = url.pathname.replace(`{${key}}`, String(value));
          }
          const response = await fetch(url, {
            method: endpoint.method,
            headers: {
              'Content-Type': 'application/json',
              ...(await config.headers?.({ container, requestContext, continuation })),
            },
            body: input.body ? JSON.stringify(input.body) : undefined,
          });
          if (!response.ok) {
            console.error(await response.text());
            throw new Error(`Failed to fetch ${endpoint.method} ${endpoint.path}: ${response.statusText}`);
          }
          const data = await response.json();
          return data;
        },
      });
    });

    taskService.register(tasks);
  },
});

export { openApi };
