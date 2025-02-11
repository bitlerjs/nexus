import { Container, Static, TSchema, Type } from '@bitlerjs/nexus';

type ValidateOptions<T extends TSchema> = {
  input: Static<T>;
  container: Container;
};

type Config<T extends TSchema = TSchema> = {
  kind: string;
  name?: string;
  group?: string;
  description?: string;
  schema: T;
  validate?: (options: ValidateOptions<T>) => Promise<void>;
};

const configSchema = Type.Object({
  kind: Type.String(),
  name: Type.Optional(Type.String()),
  group: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  schema: Type.Any(),
});

const createConfig = <T extends TSchema>(config: Config<T>) => config;

export { createConfig, configSchema, type Config };
