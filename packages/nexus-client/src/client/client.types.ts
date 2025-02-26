type ServerDefinition = {
  tasks: Record<
    string,
    {
      input: unknown;
      output: unknown;
    }
  >;
  entities: Record<
    string,
    {
      item: unknown;
      find?: unknown;
      create?: unknown;
      update?: unknown;
    }
  >;
  sources: Record<string, unknown>;
  events: Record<
    string,
    {
      input: unknown;
      output: unknown;
    }
  >;
};

export { type ServerDefinition };
