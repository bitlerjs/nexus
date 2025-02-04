import { Continuation } from '../continuation/continuation.js';
import { Container } from '../container/container.js';
import { RequestContext } from '../request-context/request-context.js';
import { parseWithSchema } from '../utils/schema.js';
import { Sources } from '../sources/sources.js';

import { Task } from './tasks.task.js';

type RunOptions = {
  task: Task;
  input: unknown;
  requestContext: RequestContext;
  continuation: Continuation;
};

class TasksService {
  #tasks = new Map<string, Task>();
  #container: Container;

  constructor(container: Container) {
    this.#container = container;
  }

  public register = (tasks: Task<any, any>[]) => {
    tasks.forEach((task) => {
      this.#tasks.set(task.kind, task);
    });
  };

  public list = () => {
    return Array.from(this.#tasks.values());
  };

  public get = (kind: string) => {
    return this.#tasks.get(kind);
  };

  public run = async (options: RunOptions) => {
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
