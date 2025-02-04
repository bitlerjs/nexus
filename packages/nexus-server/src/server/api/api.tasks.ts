import { Container, Continuation, RequestContext, TasksService, Type } from '@bitlerjs/nexus';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

type Options = {
  container: Container;
  prefix: string;
};
const tasksPlugin: FastifyPluginAsyncTypebox<Options> = async (app, options) => {
  const tasksService = options.container.get(TasksService);

  app.route({
    method: 'GET',
    url: '',
    schema: {
      tags: ['tasks'],
      operationId: 'tasks',
      summary: 'List tasks',
      response: {
        200: Type.Array(
          Type.Object({
            kind: Type.String(),
            name: Type.String(),
            description: Type.String(),
          }),
        ),
      },
    },
    handler: async (req) => {
      const tasksService = req.container.get(TasksService);
      return tasksService.list().map((task) => ({
        kind: task.kind,
        name: task.name,
        description: task.description,
      }));
    },
  });

  app.route({
    method: 'GET',
    url: '/describe/:kind',
    schema: {
      tags: ['tasks'],
      operationId: 'tasks.run',
      summary: 'Run a task',
      params: Type.Object({
        kind: Type.String(),
      }),
      response: {
        200: Type.Object({
          kind: Type.String(),
          name: Type.String(),
          description: Type.String(),
          input: Type.Unknown(),
          output: Type.Unknown(),
        }),
      },
    },
    handler: async (req) => {
      const tasksService = req.container.get(TasksService);
      const current = tasksService.get(req.params.kind);
      if (!current) {
        throw new Error('Task not found');
      }

      return {
        kind: current.kind,
        name: current.name,
        description: current.description,
        input: current.input,
        output: current.output,
      };
    },
  });
  for (const task of tasksService.list()) {
    app.route({
      method: 'POST',
      url: `/run/${task.kind}`,
      schema: {
        tags: ['tasks'],
        operationId: `task.${task.kind}`,
        summary: task.name,
        description: task.description,
        body: Type.Object({
          input: task.input,
          continuation: Type.Optional(Type.Record(Type.String(), Type.Record(Type.String(), Type.Unknown()))),
        }),
        response: {
          200: Type.Object({
            result: Type.Unsafe(task.output),
            continuation: Type.Record(Type.String(), Type.Record(Type.String(), Type.Unknown())),
          }),
        },
      },
      handler: async (req) => {
        const tasksService = req.container.get(TasksService);
        const current = tasksService.get(task.kind);
        const continuation = Continuation.parse({
          container: req.container,
          items: req.body.continuation,
        });
        if (!current) {
          throw new Error('Task not found');
        }
        const result = await tasksService.run({
          task: current,
          input: req.body.input,
          requestContext: new RequestContext(),
          continuation,
        });

        return {
          result: result.result,
          continuation: result.continuation.toJSON(),
        };
      },
    });
  }
};

export { tasksPlugin };
