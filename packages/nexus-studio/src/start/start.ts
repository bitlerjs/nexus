import { existsSync } from 'fs';
import { resolve } from 'path';

import { setup, Setup } from '@bitlerjs/nexus-server';
import fastifyStatic from '@fastify/static';

const getFirstExisiting = (path: string, files: string[]) => {
  for (const e of files) {
    const fullPath = resolve(path, e);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }
};

const start = async (config?: string) => {
  let configLocation = config;
  if (!configLocation) {
    configLocation = getFirstExisiting(process.cwd(), [
      'nexus.config.mts',
      'nexus.config.cts',
      'nexus.config.ts',
      'nexus.config.mjs',
      'nexus.config.cjs',
      'nexus.config.js',
    ]);
  }
  if (!configLocation) {
    console.error('No config file found');
    process.exit(1);
  }
  const configurationModule = await import(configLocation);
  const configuration: Setup = configurationModule.config || configurationModule.default;
  await setup({
    ...configuration,
    onServerSetup: async (app) => {
      const serverPath = resolve(import.meta.dirname, '..', '..', 'public');
      await app.register(fastifyStatic, {
        root: serverPath,
        wildcard: false,
        prefix: '/studio',
      });
      await configuration.onServerSetup?.(app);
    },
  });
};

export { start };
