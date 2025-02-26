import { useQuery, QueryOptions } from '@tanstack/react-query';
import { ServerDefinition } from '@bitlerjs/nexus-client-ws';

import { useNexus } from '../provider/provider.js';
import { useHasEntity } from '../entities/entities.js';

type QueryType<T extends ServerDefinition, TKey extends keyof T['entities']> = typeof useQuery<
  {
    kind: TKey;
    input: {
      ids: string[];
    };
  },
  unknown,
  T['entities'][TKey]['item']
>;

const useEntitiesByIdQuery = <T extends ServerDefinition, TKey extends keyof T['entities']>({
  kind,
  input,
  ...options
}: QueryOptions<unknown, unknown, T['entities'][TKey]['item']> & {
  kind: TKey;
  queryKey: readonly unknown[];
  input: {
    ids: string[];
  };
  enabled?: boolean;
  continuation?: Record<string, Record<string, unknown>>;
}): ReturnType<QueryType<T, TKey>> & { available: boolean } => {
  const { client, queryClient } = useNexus<T>();
  const has = useHasEntity(kind as string);
  const result = useQuery(
    {
      ...options,
      enabled: has && options.enabled,
      queryFn: async () => {
        const result = await client?.entities.get(kind, input.ids);
        return result;
      },
    },
    queryClient,
  );

  return {
    ...(result as any),
    available: has,
  };
};

const createEntityByIdHooks = <T extends ServerDefinition>() => {
  const typesUseCapabilityQuery = <TKey extends keyof T['entities']>(
    ...args: Parameters<typeof useEntitiesByIdQuery<T, TKey>>
  ) => useEntitiesByIdQuery(...args);

  return {
    useFindEntitiesQuery: typesUseCapabilityQuery,
  };
};

export { useEntitiesByIdQuery, createEntityByIdHooks };
