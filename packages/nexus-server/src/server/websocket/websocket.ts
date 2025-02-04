import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import fastifyWebsocket from '@fastify/websocket';

import { WebSocketClient } from './websocket.client.js';

const wsPlugin: FastifyPluginAsyncTypebox = async (app) => {
  await app.register(fastifyWebsocket);

  app.get('', { websocket: true }, async (socket, req) => {
    await WebSocketClient.setup({
      socket,
      container: req.container,
    });
  });
};

export { wsPlugin };
