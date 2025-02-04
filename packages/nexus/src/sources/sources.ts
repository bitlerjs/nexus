import { Container } from '../container/container.js';

import { SourceProvidersService } from './sources.providers.js';

type SourcesOptions = {
  container: Container;
};

class Sources {
  #sources: Map<string, Set<unknown>>;
  #options: SourcesOptions;

  constructor(options: SourcesOptions) {
    this.#sources = new Map();
    this.#options = options;
  }

  public register = (kind: string, value: unknown) => {
    const { container } = this.#options;
    const sourceProvidersService = container.get(SourceProvidersService);
    const provider = sourceProvidersService.get(kind);
    if (!provider) {
      throw new Error(`Source provider for kind ${kind} not found`);
    }
    const parsedValue = provider.schema.safeParse(value);
    if (!parsedValue.success) {
      throw new Error(`Invalid value for kind ${kind}: ${parsedValue.error.message}`);
    }
    if (!this.#sources.has(kind)) {
      this.#sources.set(kind, new Set());
    }
    this.#sources.get(kind)?.add(parsedValue.data);
  };

  public list = () => {
    return Object.fromEntries(this.#sources.entries());
  };
}

export * from './sources.provider.js';
export * from './sources.providers.js';
export { Sources };
