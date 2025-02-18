import { Static, TSchema } from '@sinclair/typebox';

import { Continuation } from '../continuation/continuation.js';
import { Container } from '../container/container.js';
import { RequestContext } from '../request-context/request-context.js';
import { parseWithSchema } from '../utils/schema.js';
import { Sources } from '../sources/sources.js';
import { EventsService } from '../events/events.js';

import { Task } from './tasks.task.js';
import { tasksUpdated } from './tasks.events.js';

type RunOptions<TInput extends TSchema> = {
  task: Task<TInput, any>;
  input: Static<TInput>;
  requestContext: RequestContext;
  continuation: Continuation;
};

class TasksService {
  #tasks = new Map<string, Task>();
  #container: Container;

  constructor(container: Container) {
    this.#container = container;
    const eventsService = container.get(EventsService);
    eventsService.register([tasksUpdated]);
  }

  public register = (tasks: Task<any, any>[]) => {
    tasks.forEach((task) => {
      this.#tasks.set(task.kind, task);
    });
    const eventsService = this.#container.get(EventsService);
    eventsService.emit(tasksUpdated, {});
  };

  public unregister = (tasks: Task<any, any>[]) => {
    tasks.forEach((task) => {
      this.#tasks.delete(task.kind);
    });
    const eventsService = this.#container.get(EventsService);
    eventsService.emit(tasksUpdated, {});
  };

  public list = () => {
    return Array.from(this.#tasks.values());
  };

  public get = (kind: string) => {
    return this.#tasks.get(kind);
  };

  public run = async <T extends TSchema>(options: RunOptions<T>) => {
    const { task, requestContext, continuation, input } = options;
    const sources = new Sources({
      container: this.#container,
    });

    const result = await task.handler({
      container: this.#container,
      sources,
      input: parseWithSchema(task.input, input),

      requestContext,
      continuation,
    });

    return {
      result: parseWithSchema(task.output, result),
      sources,
      continuation,
    };
  };
}

export * from './tasks.task.js';
export { TasksService };
