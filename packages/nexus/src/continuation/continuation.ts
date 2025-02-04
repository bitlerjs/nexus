import { nanoid } from 'nanoid';
import { Static, TSchema } from '@sinclair/typebox';

import { Container } from '../container/container.js';

import { ContinuationItem } from './continuation.items.js';

type SetOptions<T extends TSchema> = {
  item: ContinuationItem<T>;
  value: Static<T>;
  id?: string;
};

type ContinuationOptions = {
  items?: Record<string, Record<string, unknown>>;
  container: Container;
};

class Continuation {
  #items: Map<string, Map<string, unknown>>;

  constructor(options: ContinuationOptions) {
    this.#items = new Map();
    for (const [kind, items] of Object.entries(options.items ?? {})) {
      this.#items.set(kind, new Map(Object.entries(items)));
    }
  }

  public set = <T extends TSchema>(options: SetOptions<T>) => {
    const { item, value, id = nanoid() } = options;

    if (!this.#items.has(item.kind)) {
      this.#items.set(item.kind, new Map());
    }

    this.#items.get(item.kind)?.set(id, value);

    return id;
  };

  public get = <T extends TSchema>(item: ContinuationItem<T>) => {
    const result = this.#items.get(item.kind) as Map<string, Static<T>> | undefined;
    if (!result) {
      return {};
    }
    return Object.fromEntries(result);
  };

  public clear = (item: ContinuationItem) => {
    this.#items.delete(item.kind);
  };

  public remove = (item: ContinuationItem, id: string) => {
    this.#items.get(item.kind)?.delete(id);
  };

  public get hasData() {
    return this.#items.size > 0;
  }

  public toJSON = () => {
    const result: Record<string, Record<string, unknown>> = {};

    for (const [kind, items] of this.#items) {
      result[kind] = Object.fromEntries(items);
    }

    return result;
  };

  public toText = () => {
    return JSON.stringify(this.toJSON(), null, 2);
  };

  public static parse = (options: ContinuationOptions) => {
    const continuation = new Continuation(options);

    return continuation;
  };
}

export * from './continuation.items.js';
export { Continuation };
