import { Container } from '@bitlerjs/nexus';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

import { tasksPlugin } from './api.tasks.js';
import { specsPlugin } from './api.specs.js';

type Options = {
  container: Container;
};
const apiPlugin: FastifyPluginAsyncTypebox<Options> = async (app, options) => {
  await app.register(tasksPlugin, {
    container: options.container,
    prefix: '/tasks',
  });

  await app.register(specsPlugin, {
    prefix: '/specs',
  });
};

export { apiPlugin };
