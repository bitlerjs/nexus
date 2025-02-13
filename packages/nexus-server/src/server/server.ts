import { Container, Type } from '@bitlerjs/nexus';
import { Ajv } from 'ajv';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import scalar from '@scalar/fastify-api-reference';
import fastify from 'fastify';

import { apiPlugin } from './api/api.js';
import { wsPlugin } from './websocket/websocket.js';
import { JwtValidators } from './oidc/oidc.js';

type CreateServerOptions = {
  setup?: (app: fastify.FastifyInstance) => Promise<void>;
  oidc?: {
    issuerUrl: string;
    clientId?: string;
    audience?: string;
  };
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
    await app.register(fastifyCors);
    await app.register(scalar, {
      routePrefix: '/api/docs',
    });
    app.setValidatorCompiler(({ schema }) => {
      const validate = ajv.compile(schema);
      return validate;
    });
    app.addHook('onRequest', async (request) => {
      request.container = this.#container;
    });

    await app.register(wsPlugin, {
      prefix: '/api/ws',
      oidc: options.oidc,
    });

    app.route({
      url: '/api/config',
      method: 'GET',
      schema: {
        response: {
          200: Type.Object({
            oidc: Type.Optional(
              Type.Object({
                issuerUrl: Type.String(),
                clientId: Type.Optional(Type.String()),
              }),
            ),
          }),
        },
      },
      handler: async () => {
        return {
          oidc: options.oidc && {
            issuerUrl: options.oidc.issuerUrl,
            clientId: options.oidc.clientId,
          },
        };
      },
    });

    await app.register(
      async (app) => {
        if (options.oidc) {
          const { issuerUrl, audience } = options.oidc;
          const validators = this.#container.get(JwtValidators);
          const validator = validators.get(issuerUrl);

          app.addHook('onRequest', async (request) => {
            const authorization = request.headers.authorization;
            if (!authorization) {
              throw new Error('Authorization header is required');
            }

            const [type, token] = authorization.split(' ');
            if (type !== 'Bearer') {
              throw new Error('Authorization type must be Bearer');
            }

            await validator.validateToken(token, audience);
          });
        }

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
