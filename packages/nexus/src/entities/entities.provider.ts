import { Static, TSchema } from '@sinclair/typebox';

import { RequestContext } from '../request-context/request-context.js';
import { Container } from '../container/container.js';

type EntityProviderGetOptions = {
  input: {
    ids: string[];
  };
  container: Container;
  requestContext: RequestContext;
};

type EntitiyWithInputOptions<T extends TSchema> = {
  input: Static<T>;
  container: Container;
  requestContext: RequestContext;
};

type EntityProvider<
  TItemSchema extends TSchema = TSchema,
  TFindSchema extends TSchema = TSchema,
  TCreateSchema extends TSchema = TSchema,
  TUpdateSchema extends TSchema = TSchema,
> = {
  kind: string;
  name: string;
  description: string;
  schema: TItemSchema;
  get: (options: EntityProviderGetOptions) => Promise<Static<TItemSchema>[]>;
  find?: {
    schema: TFindSchema;
    handler: (options: EntitiyWithInputOptions<TFindSchema>) => Promise<Static<TItemSchema>[]>;
  };
  create?: {
    schema: TCreateSchema;
    handler: (options: EntitiyWithInputOptions<TCreateSchema>) => Promise<string>;
  };
  update?: {
    schema: TUpdateSchema;
    handler: (options: EntitiyWithInputOptions<TUpdateSchema>) => Promise<void>;
  };
  delete?: {
    handler: (options: EntityProviderGetOptions) => Promise<void>;
  };
};

const createEntityProvider = <
  TItemSchema extends TSchema = TSchema,
  TFindSchema extends TSchema = TSchema,
  TCreateSchema extends TSchema = TSchema,
  TUpdateSchema extends TSchema = TSchema,
>(
  provider: EntityProvider<TItemSchema, TFindSchema, TCreateSchema, TUpdateSchema>,
) => provider;

export { createEntityProvider, type EntityProvider };
