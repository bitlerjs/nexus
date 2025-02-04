import { Container } from '@bitlerjs/nexus';
import { Ajv } from 'ajv';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import scalar from '@scalar/fastify-api-reference';
import fastify from 'fastify';

import { apiPlugin } from './api/api.js';
import { wsPlugin } from './websocket/websocket.js';

type CreateServerOptions = {
  setup?: (app: fastify.FastifyInstance) => Promise<void>;
};

const ajv = new Ajv({
  strict: false,
  formats: {
    'date-time': true,
    date: true,
  },
});

class ServerService {
  #container: Container;

  constructor(container: Container) {
    this.#container = container;
  }

  public create = async (options: CreateServerOptions = {}) => {
    const app = fastify().withTypeProvider<TypeBoxTypeProvider>();
    await app.register(fastifySwagger, {});
    await app.register(scalar, {
      routePrefix: '/api/docs',
    });
    app.setValidatorCompiler(({ schema }) => {
      const validate = ajv.compile(schema);
      return validate;
    });
    await app.register(
      async (app) => {
        await app.register(fastifyCors);

        app.addHook('onRequest', async (request) => {
          request.container = this.#container;
        });

        await app.register(wsPlugin, {
          prefix: '/ws',
        });
        await app.register(apiPlugin, {
          container: this.#container,
        });
      },
      {
        prefix: '/api',
      },
    );

    await options.setup?.(app);
    await app.ready();
    app.swagger();

    return app;
  };
}

export { ServerService };
