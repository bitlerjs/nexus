import { Container } from '../container/container.js';

import { Extension } from './extensions.extension.js';

class ExtensionsService {
  #container: Container;

  constructor(container: Container) {
    this.#container = container;
  }

  public register = async <TConfig>(extension: Extension<TConfig>, config: TConfig) => {
    await extension.setup({ config, container: this.#container });
  };
}

export * from './extensions.extension.js';
export { ExtensionsService };
