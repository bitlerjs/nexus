import { MutationOptions, useMutation } from '@tanstack/react-query';
import { ServerDefinition } from '@bitlerjs/nexus-client-ws';

import { useNexus } from '../provider/provider.js';
import { useHasEntity } from '../entities/entities.js';

type MutationType<T extends ServerDefinition, TKey extends keyof T['entities']> = typeof useMutation<
  T['entities'][TKey]['item'][],
  unknown,
  {
    kind: TKey;
    input: T['entities'][TKey]['find'];
  }
>;

const useFindEntitiesMutation = <T extends ServerDefinition, TKey extends keyof T['entities']>({
  kind,
  ...options
}: MutationOptions<T['entities'][TKey]['item'][], unknown, unknown> & {
  kind: TKey;
  enabled?: boolean;
}): ReturnType<MutationType<T, TKey>> & { available: boolean } => {
  const { client, queryClient } = useNexus<T>();
  const has = useHasEntity(kind as string);
  const result = useMutation(
    {
      ...options,
      mutationFn: async (input) => {
        const result = await client?.entities.find(kind, input);
        if (!result) {
          throw new Error('Find failed');
        }
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

const createFindEntitiesMutation = <T extends ServerDefinition>() => {
  const typesUseCapabilityQuery = <TKey extends keyof T['entities']>(
    ...args: Parameters<typeof useFindEntitiesMutation<T, TKey>>
  ) => useFindEntitiesMutation(...args);

  return {
    useEntitiesByIdQuery: typesUseCapabilityQuery,
  };
};

export { createFindEntitiesMutation, useFindEntitiesMutation };
