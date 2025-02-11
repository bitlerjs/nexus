import { Static, TSchema } from '@sinclair/typebox';

import { Container } from '../container/container.js';

import { BootstrapItem } from './bootstrap.item.js';

type BootstrapOptions = {
  container: Container;
};
class Bootstrap {
  #options: BootstrapOptions;
  #data: Record<string, unknown> = {};

  constructor(options: BootstrapOptions) {
    this.#options = options;
  }

  public get hasData() {
    return Object.keys(this.#data).length > 0;
  }

  public toJSON = () => {
    return Object.entries(this.#data).map(([kind, data]) => ({
      kind,
      data,
    }));
  };

  public toText = () => {
    return this.toJSON()
      .map(({ kind, data }) => `${kind}: ${JSON.stringify(data)}`)
      .join('\n');
  };

  public get = <T extends TSchema>(item: BootstrapItem<T>) => {
    return this.#data[item.kind] as Static<T>;
  };

  public load = async (items: BootstrapItem<any>[]) => {
    for (const item of items) {
      if (this.#data[item.kind]) {
        continue;
      }
      this.#data[item.kind] = await item.handler({
        container: this.#options.container,
      });
    }
  };
}

export { Bootstrap };
export * from './bootstrap.item.js';
