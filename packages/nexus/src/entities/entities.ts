import { EntityProvider } from './entities.provider.js';

class EntityProvidersService {
  #entityProviders: Map<string, EntityProvider>;

  constructor() {
    this.#entityProviders = new Map();
  }

  public register = (providers: EntityProvider[]) => {
    providers.forEach((provider) => {
      this.#entityProviders.set(provider.kind, provider);
    });
  };

  public list = () => {
    return Array.from(this.#entityProviders.values());
  };
}

export * from './entities.provider.js';
export { EntityProvidersService };
