import { useMutation, type MutationOptions } from '@tanstack/react-query';
import { type ServerDefinition } from '@bitlerjs/nexus-client-ws';

import { useNexus } from '../provider/provider.js';
import { useHasEntity } from '../entities/entities.js';

type MutationType<T extends ServerDefinition, TKey extends keyof T['entities']> = typeof useMutation<
  { id: string },
  unknown,
  T['entities'][TKey]['create']
>;

const useCreateEntityMutation = <T extends ServerDefinition, TKey extends keyof T['entities']>({
  kind,
  ...options
}: MutationOptions<{ id: string }, unknown, T['entities'][TKey]['create'], unknown> & {
  kind: TKey;
}): ReturnType<MutationType<T, TKey>> & { available: boolean } => {
  const { client, queryClient } = useNexus<T>();
  const hasTask = useHasEntity(kind as string);
  const result = useMutation(
    {
      ...options,
      mutationFn: async (input) => {
        const result = await client?.entities.create(kind, input);
        if (!result) {
          throw new Error('Task failed');
        }
        return result;
      },
    },
    queryClient,
  );

  return {
    ...result,
    available: hasTask,
  };
};

const createCreateEntityMutationHooks = <T extends ServerDefinition>() => {
  const typesUseTaskMutation = <TKey extends keyof T['entities']>(
    ...args: Parameters<typeof useCreateEntityMutation<T, TKey>>
  ) => useCreateEntityMutation(...args);

  return {
    useCreateEntityMutation: typesUseTaskMutation,
  };
};

export { useCreateEntityMutation, createCreateEntityMutationHooks };
