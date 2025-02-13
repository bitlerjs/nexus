import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import fastifyWebsocket from '@fastify/websocket';

import { WebSocketClient } from './websocket.client.js';

type Options = {
  prefix: string;
  oidc?: {
    issuerUrl: string;
    audience?: string;
  };
};

const wsPlugin: FastifyPluginAsyncTypebox<Options> = async (app, options) => {
  await app.register(fastifyWebsocket);

  app.get('', { websocket: true }, async (socket, req) => {
    await WebSocketClient.setup({
      socket,
      container: req.container,
      oidc: options.oidc,
    });
  });
};

export { wsPlugin };
