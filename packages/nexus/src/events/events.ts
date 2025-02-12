import { Static, TSchema } from '@sinclair/typebox';

import { parseWithSchema } from '../exports.js';

import { Event } from './events.event.js';

type SubscribeOptions<TInputSchema extends TSchema, TOutputSchema extends TSchema> = {
  event: Event<TInputSchema, TOutputSchema>;
  input: Static<TInputSchema>;
  handler: (payload: Static<TOutputSchema>) => void;
  abortSignal?: AbortSignal;
};

class EventsService {
  #events: Map<string, Event>;
  #listeners: Record<
    string,
    {
      handler: (payload: any) => void;
      input: unknown;
    }[]
  >;

  constructor() {
    this.#events = new Map();
    this.#listeners = {};
  }

  public register = (events: Event<any, any>[]) => {
    events.forEach((event) => {
      this.#events.set(event.kind, event);
    });
  };

  public list = () => {
    return Array.from(this.#events.values());
  };

  public get = (king: string) => {
    return this.#events.get(king);
  };

  public emit = <TInputSchema extends TSchema, TOutputSchema extends TSchema>(
    event: Event<TInputSchema, TOutputSchema>,
    payload: Static<TOutputSchema>,
  ) => {
    const parsedEvent = parseWithSchema(event.output, payload);
    const listeners = this.#listeners[event.kind];
    if (!listeners) {
      return;
    }
    Promise.all(
      (listeners || []).map(async ({ handler, input }) => {
        if (event.filter && !(await event.filter({ input, event: parsedEvent }))) {
          return;
        }
        handler(parsedEvent);
      }),
    );
  };

  public subscribe = <TInputSchema extends TSchema, TOutputSchema extends TSchema>({
    event,
    input,
    handler,
    abortSignal,
  }: SubscribeOptions<TInputSchema, TOutputSchema>) => {
    const reref = (input: Static<TInputSchema>) => handler(input);
    if (!this.#listeners[event.kind]) {
      this.#listeners[event.kind] = [];
    }
    const listeners = this.#listeners[event.kind];
    listeners.push({
      handler: reref,
      input,
    });
    const unsubscribe = () => {
      const listeners = this.#listeners[event.kind];
      if (!listeners) {
        return;
      }
      const index = listeners.findIndex((listener) => listener.handler === reref);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
    abortSignal?.addEventListener('abort', unsubscribe);
    return unsubscribe;
  };
}

export * from './events.event.js';
export { EventsService };
