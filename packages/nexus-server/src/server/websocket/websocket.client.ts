import {
  Container,
  Continuation,
  EntityProvidersService,
  parseWithSchema,
  RequestContext,
  TasksService,
} from '@bitlerjs/nexus';
import { createResponder, RequestHandler } from '@bitlerjs/nexus-socket';
import { EventsService } from '@bitlerjs/nexus/dist/events/events.js';
import { WebSocket } from '@fastify/websocket';

import { JwtValidators } from '../oidc/oidc.js';

type WebSocketClientOptions = {
  socket: WebSocket;
  container: Container;
  requestContext: RequestContext;
};

type SetupWebSocketClient = {
  socket: WebSocket;
  container: Container;
  oidc?: {
    issuerUrl: string;
    audience?: string;
  };
};

type Authenticate = {
  type: 'authenticate';
  id?: string;
  payload: {
    headers: Record<string, string>;
  };
};

type Subscription = {
  abortController: AbortController;
  input: Record<string, unknown>;
};

class WebSocketClient {
  #options: WebSocketClientOptions;
  #subscriptions: Map<string, Subscription>;
  #responder: ReturnType<typeof createResponder>;

  constructor(options: WebSocketClientOptions) {
    this.#subscriptions = new Map();
    this.#options = options;
    options.socket.addEventListener('message', this.#onMessage);
    options.socket.addEventListener('close', this.#onClose);
    this.#responder = createResponder({
      'task.run': this.#onTaskRun,
      'task.list': this.#onTaskList,
      'task.describe': this.#onTaskDescribe,
      'event.subscribe': this.#onEventSubscribe,
      'event.unsubscribe': this.#onEventUnsubscribe,
      'event.list': this.#onEventList,
      'event.describe': this.#onEventDescribe,
      'entity.list': this.#onEntityList,
      'entity.describe': this.#onEntityDescribe,
      'entity.get': this.#onEntityGet,
      'entity.find': this.#onEntityFind,
      'entity.create': this.#onEntityCreate,
      'entity.update': this.#onEntityUpdate,
    });
  }

  #onClose = () => {
    for (const subscription of this.#subscriptions.values()) {
      subscription.abortController.abort();
    }
  };

  #onEntityList: RequestHandler<'entity.list'> = async () => {
    const { container } = this.#options;
    const entitiesService = container.get(EntityProvidersService);
    return entitiesService.list().map((entity) => ({
      kind: entity.kind,
      name: entity.name,
      description: entity.description,
      find: !!entity.find,
      create: !!entity.create,
      update: !!entity.update,
    }));
  };

  #onEntityDescribe: RequestHandler<'entity.describe'> = async ({ kind }) => {
    const { container } = this.#options;
    const entitiesService = container.get(EntityProvidersService);
    const entity = entitiesService.get(kind);
    if (!entity) {
      throw new Error(`Entity ${kind} not found`);
    }
    return {
      kind: entity.kind,
      name: entity.name,
      description: entity.description,
      item: entity.schema,
      find: entity.find?.schema,
      create: entity.create?.schema,
      update: entity.update?.schema,
    };
  };

  #onEntityFind: RequestHandler<'entity.find'> = async ({ kind, input }) => {
    const { container } = this.#options;
    const entitiesService = container.get(EntityProvidersService);
    const entity = entitiesService.get(kind);
    if (!entity) {
      throw new Error(`Entity ${kind} not found`);
    }
    if (!entity.find) {
      throw new Error(`Entity ${kind} does not support find`);
    }
    const result = await entity.find.handler({
      input,
      requestContext: this.#options.requestContext,
      container,
    });
    return result.map((item) => parseWithSchema(entity.schema, item));
  };

  #onEntityCreate: RequestHandler<'entity.create'> = async ({ kind, input }) => {
    const { container } = this.#options;
    const entitiesService = container.get(EntityProvidersService);
    const entity = entitiesService.get(kind);
    if (!entity) {
      throw new Error(`Entity ${kind} not found`);
    }
    if (!entity.create) {
      throw new Error(`Entity ${kind} does not support create`);
    }
    const id = await entity.create.handler({
      input,
      requestContext: this.#options.requestContext,
      container,
    });
    return { id };
  };

  #onEntityUpdate: RequestHandler<'entity.update'> = async ({ kind, input }) => {
    const { container } = this.#options;
    const entitiesService = container.get(EntityProvidersService);
    const entity = entitiesService.get(kind);
    if (!entity) {
      throw new Error(`Entity ${kind} not found`);
    }
    if (!entity.update) {
      throw new Error(`Entity ${kind} does not support update`);
    }
    await entity.update.handler({
      input,
      requestContext: this.#options.requestContext,
      container,
    });
    return {};
  };

  #onEntityGet: RequestHandler<'entity.get'> = async ({ kind, ids }) => {
    const { container } = this.#options;
    const entitiesService = container.get(EntityProvidersService);
    const entity = entitiesService.get(kind);
    if (!entity) {
      throw new Error(`Entity ${kind} not found`);
    }
    return entity.get({
      input: { ids },
      requestContext: this.#options.requestContext,
      container,
    });
  };

  #onTaskRun: RequestHandler<'task.run'> = async ({ kind, input, continuation }) => {
    const { container, requestContext } = this.#options;
    const tasksService = container.get(TasksService);
    const task = tasksService.get(kind);
    if (!task) {
      throw new Error(`Task ${kind} not found`);
    }
    const result = await tasksService.run({
      task,
      input,
      requestContext,
      continuation: Continuation.parse({
        container,
        items: continuation,
      }),
    });
    return {
      result: result.result,
      continuation: result.continuation.toJSON(),
    };
  };

  #onTaskList: RequestHandler<'task.list'> = async () => {
    const { container } = this.#options;
    const tasksService = container.get(TasksService);
    return tasksService.list();
  };

  #onTaskDescribe: RequestHandler<'task.describe'> = async ({ kind }) => {
    const { container } = this.#options;
    const tasksService = container.get(TasksService);
    const task = tasksService.get(kind);
    if (!task) {
      throw new Error(`Task ${kind} not found`);
    }
    return task;
  };

  #onEventList: RequestHandler<'event.list'> = async () => {
    const { container } = this.#options;
    const eventsService = container.get(EventsService);
    return eventsService.list();
  };

  #onEventDescribe: RequestHandler<'event.describe'> = async ({ kind }) => {
    const { container } = this.#options;
    const eventsService = container.get(EventsService);
    const event = eventsService.get(kind);
    if (!event) {
      throw new Error(`Event ${kind} not found`);
    }
    return event;
  };

  #onEventSubscribe: RequestHandler<'event.subscribe'> = async ({ kind, input, id }) => {
    const { container, socket } = this.#options;
    const eventsService = container.get(EventsService);
    const event = eventsService.get(kind);
    if (!event) {
      throw new Error(`Event ${kind} not found`);
    }
    const abortController = new AbortController();
    eventsService.subscribe({
      event,
      input,
      handler: (payload) => {
        socket.send(JSON.stringify({ type: 'event', payload, id }));
      },
    });
    this.#subscriptions.set(id, {
      input,
      abortController,
    });
    return {};
  };

  #onEventUnsubscribe: RequestHandler<'event.unsubscribe'> = async ({ id }) => {
    const subscription = this.#subscriptions.get(id);
    if (subscription) {
      subscription.abortController.abort();
      this.#subscriptions.delete(id);
    }
    return {};
  };

  #onMessage = async ({ data }: MessageEvent) => {
    const response = await this.#responder.getResponse(JSON.parse(data));
    this.#options.socket.send(JSON.stringify(response));
  };

  public static setup = (options: SetupWebSocketClient) =>
    new Promise<WebSocketClient>((resolve, reject) => {
      const timeout = setTimeout(() => {
        options.socket.close();
        reject(new Error('Timeout'));
        options.socket.removeEventListener('message', authHandler);
        options.socket.removeEventListener('message', authHandler);
      }, 3000);

      const disconnectHandler = () => {
        clearTimeout(timeout);
        options.socket.removeEventListener('message', authHandler);
        reject(new Error('Disconnected'));
      };
      const authHandler = async (message: MessageEvent) => {
        try {
          const { type, payload } = JSON.parse(message.data) as Authenticate;
          if (type !== 'authenticate') {
            throw new Error('Invalid message');
          }
          const requestContext = new RequestContext();
          if (options.oidc) {
            const authorization = payload.headers.Authorization;
            if (!authorization) {
              throw new Error('Authorization header is required');
            }

            const [type, token] = authorization.split(' ');
            if (type !== 'Bearer') {
              throw new Error('Authorization type must be Bearer');
            }
            const { issuerUrl, audience } = options.oidc;
            const validators = options.container.get(JwtValidators);
            const validator = validators.get(issuerUrl);
            await validator.validateToken(token, audience);
          }
          resolve(
            new WebSocketClient({
              container: options.container,
              socket: options.socket,
              requestContext,
            }),
          );
          options.socket.send(JSON.stringify({ type: 'authenticated' }));
        } catch (error) {
          reject(error);
          console.error(error instanceof Error ? error.message : error);
          options.socket.send(JSON.stringify({ type: 'error', payload: 'Invalid message' }));
        } finally {
          clearTimeout(timeout);
          options.socket.removeEventListener('message', authHandler);
          options.socket.removeEventListener('close', disconnectHandler);
        }
      };

      options.socket.addEventListener('message', authHandler);
      options.socket.addEventListener('close', disconnectHandler);
    });
}

export { WebSocketClient };
