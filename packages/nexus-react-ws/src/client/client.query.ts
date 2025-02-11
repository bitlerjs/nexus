import { useQuery, QueryOptions } from '@tanstack/react-query';
import { ServerDefinition } from '@bitlerjs/nexus-client-ws';

import { useNexus } from '../provider/provider.js';
import { useHasTask } from '../exports.js';

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
  enabled?: boolean;
  continuation?: Record<string, Record<string, unknown>>;
}): ReturnType<QueryType<T, TKey>> & { available: boolean } => {
  const { client, queryClient } = useNexus<T>();
  const hasTask = useHasTask(kind as string);
  const result = useQuery(
    {
      ...options,
      enabled: hasTask && options.enabled,
      queryFn: async () => {
        const result = await client?.tasks.run(kind, input, continuation);
        return result;
      },
    },
    queryClient,
  );

  return {
    ...(result as any),
    available: hasTask,
  };
};

const createQueryHooks = <T extends ServerDefinition>() => {
  const typesUseCapabilityQuery = <TKey extends keyof T['tasks']>(...args: Parameters<typeof useTaskQuery<T, TKey>>) =>
    useTaskQuery(...args);

  return {
    useTaskQuery: typesUseCapabilityQuery,
  };
};

export { useTaskQuery, createQueryHooks };
