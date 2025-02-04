import { Static, TSchema } from '@sinclair/typebox';

import { RequestContext } from '../request-context/request-context.js';

type EntityProviderGetOptions = {
  id: string;
  requestContext: RequestContext;
};

type EntityProvider<TItemSchema extends TSchema = TSchema> = {
  kind: string;
  name: string;
  description: string;
  schema: TItemSchema;
  get: (options: EntityProviderGetOptions) => Promise<Static<TItemSchema>>;
};

const createEntityProvider = <TItemSchema extends TSchema = TSchema>(provider: EntityProvider<TItemSchema>) => provider;

export { createEntityProvider, type EntityProvider };
