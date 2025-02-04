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
  #listeners: Map<string, ((payload: any) => void)[]>;

  constructor() {
    this.#events = new Map();
    this.#listeners = new Map();
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
    const listeners = this.#listeners.get(event.kind);
    if (!listeners) {
      return;
    }
    listeners.forEach((listener) => listener(parsedEvent));
  };

  public subscribe = <TInputSchema extends TSchema, TOutputSchema extends TSchema>({
    event,
    handler,
    abortSignal,
  }: SubscribeOptions<TInputSchema, TOutputSchema>) => {
    const reref = (input: Static<TInputSchema>) => handler(input);
    const listeners = this.#listeners.get(event.name) || [];
    listeners.push(reref);
    this.#listeners.set(event.kind, listeners);
    const unsubscribe = () => {
      const listeners = this.#listeners.get(event.kind);
      if (!listeners) {
        return;
      }
      const index = listeners.indexOf(reref);
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
