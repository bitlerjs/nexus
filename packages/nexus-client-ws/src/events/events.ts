import { ServerDefinition } from '@bitlerjs/nexus-client';

import { Socket } from '../socket/socket.js';

type EventInput<
  TSchema extends ServerDefinition,
  TKind extends keyof TSchema['events'] | string,
> = TKind extends keyof TSchema['events'] ? TSchema['events'][TKind]['input'] : unknown;

type EventOutput<
  TSchema extends ServerDefinition,
  TKind extends keyof TSchema['events'] | string,
> = TKind extends keyof TSchema['events'] ? TSchema['events'][TKind]['output'] : unknown;

type EventsOptions = {
  socket: Socket;
};

type Subscription = {
  id: string;
  kind: string;
  input: unknown;
};

type SubscribeOptions = {
  signal?: AbortSignal;
};

class Events<TSchema extends ServerDefinition = ServerDefinition> {
  #options: EventsOptions;
  #subscriptions: Subscription[] = [];
  #listeners = new Map<string, (value: unknown) => void>();

  constructor(options: EventsOptions) {
    this.#options = options;
    options.socket.on('message', this.#onMessage);
    options.socket.on('connected', this.#onConnected);
  }

  #onMessage = async (data: any) => {
    if (data.type === 'event') {
      const { id } = data;
      const { value } = data.payload;
      const listener = this.#listeners.get(id);
      listener?.(value);
    }
  };

  #onConnected = async () => {
    const { socket } = this.#options;
    await Promise.all(
      this.#subscriptions.map(async ({ id, kind, input }) => {
        await socket.request('event.subscribe', { kind, id, input });
      }),
    );
  };

  public list = async () => {
    const { socket } = this.#options;
    return socket.request('event.list', {});
  };

  public describe = async (kind: string) => {
    const { socket } = this.#options;
    return socket.request('event.describe', {
      kind,
    });
  };

  public subscribe = async <TKind extends keyof TSchema['events']>(
    kind: TKind,
    input: EventInput<TSchema, TKind>,
    handler: (output: EventOutput<TSchema, TKind>) => void,
    options: SubscribeOptions = {},
  ) => {
    const { socket } = this.#options;
    const id = Math.random().toString(36).slice(2);
    await socket.request('event.subscribe', { kind: kind as string, id, input });

    const fn = (value: unknown) => handler(value as EventOutput<TSchema, TKind>);
    this.#listeners.set(id, fn);
    this.#subscriptions.push({ id, kind: kind as string, input });

    options.signal?.addEventListener('abort', () => {
      socket.request('event.unsubscribe', { id });
      this.#listeners.delete(id);
    });

    return {
      unsubscribe: () => {
        socket.request('event.unsubscribe', { id });
        this.#listeners.delete(id);
      },
    };
  };
}

export { Events, type EventInput, type EventOutput };
