import type { Container } from '@bitlerjs/nexus';
import 'fastify';

/* eslint-disable @typescript-eslint/consistent-type-definitions */

// Global augmentation, as suggested by
// https://www.fastify.io/docs/latest/Reference/TypeScript/#creating-a-typescript-fastify-plugin
declare module 'fastify' {
  interface FastifyInstance {
    readonly zod: FastifyZod<typeof models>;
  }

  interface FastifyRequest {
    container: Container;
  }
}
