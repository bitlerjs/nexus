import { ServerDefinition, TaskInput, TaskOutput } from '@bitlerjs/nexus-client';

import { Socket } from '../socket/socket.js';

type TaskOptions = {
  socket: Socket;
};

type TaskResponse<T> = {
  result: T;
  continuation: Record<string, Record<string, unknown>>;
};

class Tasks<TSchema extends ServerDefinition = ServerDefinition> {
  #options: TaskOptions;

  constructor(options: TaskOptions) {
    this.#options = options;
  }

  public list = async () => {
    const { socket } = this.#options;
    return socket.request('task.list', {});
  };

  public describe = async (kind: string) => {
    const { socket } = this.#options;
    return socket.request('task.describe', {
      kind,
    });
  };

  public run = async <TKind extends keyof TSchema['tasks']>(
    kind: TKind,
    input: TaskInput<TSchema, TKind>,
    continuation?: Record<string, Record<string, unknown>>,
  ): Promise<TaskResponse<TaskOutput<TSchema, TKind>>> => {
    const { socket } = this.#options;
    const result = await socket.request('task.run', { kind: String(kind), input, continuation });
    return result;
  };
}

export { Tasks, type TaskInput, type TaskOutput };
