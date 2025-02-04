import { type ServerDefinition } from './client.types.js';
type ClientTasksOptions = {
  url: string;
};

type TaskDescription = {
  kind: string;
  name: string;
  description: string;
  input: unknown;
  output: unknown;
};

type TaskInput<
  TServer extends ServerDefinition = ServerDefinition,
  TKey extends keyof TServer['tasks'] = keyof TServer['tasks'],
> = TServer['tasks'][TKey]['input'];

type TaskOutput<
  TServer extends ServerDefinition = ServerDefinition,
  TKey extends keyof TServer['tasks'] = keyof TServer['tasks'],
> = TServer['tasks'][TKey]['output'];

type TaskRunOptions<
  TServer extends ServerDefinition = ServerDefinition,
  TKey extends keyof TServer['tasks'] = keyof TServer['tasks'],
> = {
  input: TaskInput<TServer, TKey>;
  continuation?: Record<string, Record<string, unknown>>;
};

class ClientTasks<TServer extends ServerDefinition = ServerDefinition> {
  #options: ClientTasksOptions;

  constructor(options: ClientTasksOptions) {
    this.#options = options;
  }

  public list = async (): Promise<TaskDescription[]> => {
    const response = await fetch(`${this.#options.url}/tasks`);
    const tasks = await response.json();
    return tasks as TaskDescription[];
  };

  public describe = async <TKey extends keyof TServer['tasks']>(kind: TKey): Promise<TaskDescription> => {
    const response = await fetch(`${this.#options.url}/tasks/describe/${String(kind)}`);
    const task = await response.json();
    return task as TaskDescription;
  };

  public run = async <TKey extends keyof TServer['tasks']>(
    kind: TKey,
    options: TaskRunOptions<TServer, TKey>,
  ): Promise<TaskOutput<TServer, TKey>> => {
    const response = await fetch(`${this.#options.url}/tasks/run/${String(kind)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: options.input,
        continuation: options.continuation,
      }),
    });
    const output = await response.json();
    return output;
  };
}

export { ClientTasks, type TaskInput, type TaskOutput, type TaskRunOptions };
