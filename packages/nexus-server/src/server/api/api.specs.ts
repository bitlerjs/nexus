import { SpecsService } from '@bitlerjs/nexus';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

type Options = {
  prefix: string;
};
const specsPlugin: FastifyPluginAsyncTypebox<Options> = async (app) => {
  app.route({
    method: 'GET',
    url: '',
    schema: {
      tags: ['specs'],
      operationId: 'specs',
      summary: 'Get specs',
    },
    handler: async (req) => {
      const specsService = req.container.get(SpecsService);
      return specsService.generate();
    },
  });
};

export { specsPlugin };
