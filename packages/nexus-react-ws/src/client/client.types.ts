type TaskResponse<T> = {
  result: T;
  continuation: Record<string, Record<string, unknown>>;
};

type TaskInput<T> = {
  input: T;
  continuation?: Record<string, Record<string, unknown>>;
};

export { type TaskResponse, type TaskInput };
