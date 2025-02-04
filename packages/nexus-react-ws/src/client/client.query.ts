import { useQuery, QueryOptions } from '@tanstack/react-query';
import { ServerDefinition } from '@bitlerjs/nexus-client-ws';

import { useNexus } from '../provider/provider.js';

import { TaskInput, TaskResponse } from './client.types.js';

type QueryType<T extends ServerDefinition, TKey extends keyof T['tasks']> = typeof useQuery<
  TaskInput<T['tasks'][TKey]['input']>,
  unknown,
  TaskResponse<T['tasks'][TKey]['output']>
>;

const useTaskQuery = <T extends ServerDefinition, TKey extends keyof T['tasks']>({
  kind,
  input,
  continuation,
  ...options
}: QueryOptions<unknown, unknown, T['tasks'][TKey]['output']> & {
  kind: TKey;
  queryKey: readonly unknown[];
  input: T['tasks'][TKey]['input'];
  continuation?: Record<string, Record<string, unknown>>;
}): ReturnType<QueryType<T, TKey>> => {
  const { client, queryClient } = useNexus<T>();
  return useQuery(
    {
      ...options,
      queryFn: async () => {
        const result = await client?.tasks.run(kind, input, continuation);
        return result;
      },
    },
    queryClient,
  );
};

const createQueryHooks = <T extends ServerDefinition>() => {
  const typesUseCapabilityQuery = <TKey extends keyof T['tasks']>(...args: Parameters<typeof useTaskQuery<T, TKey>>) =>
    useTaskQuery(...args);

  return {
    useTaskQuery: typesUseCapabilityQuery,
  };
};

export { useTaskQuery, createQueryHooks };
