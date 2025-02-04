import { SourceProvider } from './sources.provider.js';

class SourceProvidersService {
  #providers: Map<string, SourceProvider>;

  constructor() {
    this.#providers = new Map();
  }

  public register = (providers: SourceProvider[]) => {
    providers.forEach((provider) => {
      this.#providers.set(provider.kind, provider);
    });
  };

  public list = () => {
    return Array.from(this.#providers.values());
  };

  public get = (kind: string) => {
    return this.#providers.get(kind);
  };
}

export { SourceProvidersService };
