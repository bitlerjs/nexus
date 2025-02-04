import { Container } from '../container/container.js';

type ExtensionSetupOptions<TConfig> = {
  config: TConfig;
  container: Container;
};

type Extension<TConfig> = {
  setup: (options: ExtensionSetupOptions<TConfig>) => Promise<void>;
};

const createExtension = <TConfig = Record<string, never>>(extension: Extension<TConfig>) => extension;

export { createExtension, type Extension };
