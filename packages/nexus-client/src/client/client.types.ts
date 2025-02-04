type ServerDefinition = {
  tasks: Record<
    string,
    {
      input: unknown;
      output: unknown;
    }
  >;
  entities: Record<string, unknown>;
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
