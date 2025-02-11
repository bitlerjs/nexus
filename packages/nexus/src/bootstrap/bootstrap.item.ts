import { Static, TSchema } from '@sinclair/typebox';

import { Container } from '../container/container.js';

type BootstrapItemHandlerOptions = {
  container: Container;
};

type BootstrapItem<T extends TSchema = TSchema> = {
  kind: string;
  name: string;
  description: string;
  schema: T;
  handler: (options: BootstrapItemHandlerOptions) => Promise<Static<T>>;
};

const createBootstrapItem = <T extends TSchema>(item: BootstrapItem<T>) => item;

export { type BootstrapItem, createBootstrapItem };
