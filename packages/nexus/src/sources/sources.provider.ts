import { TSchema } from '@sinclair/typebox';

type SourceProvider<TItemSchema extends TSchema = TSchema> = {
  kind: string;
  name: string;
  description: string;
  schema: TItemSchema;
};

const createSourceProvider = <TItemSchema extends TSchema>(provider: SourceProvider<TItemSchema>) => provider;

export { createSourceProvider, type SourceProvider };
