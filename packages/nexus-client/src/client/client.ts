import { ClientTasks } from './client.tasks.js';
import { ServerDefinition } from './client.types.js';

type ClientOptions = {
  url: string;
};

class NexusClient<TServer extends ServerDefinition = ServerDefinition> {
  #options: ClientOptions;
  #tasks?: ClientTasks<TServer>;

  constructor(options: ClientOptions) {
    this.#options = options;
  }

  public get tasks(): ClientTasks<TServer> {
    if (!this.#tasks) {
      this.#tasks = new ClientTasks<TServer>(this.#options);
    }
    return this.#tasks;
  }
}

export * from './client.tasks.js';
export { NexusClient, ServerDefinition };
