import { useMutation, type MutationOptions } from '@tanstack/react-query';
import { type ServerDefinition } from '@bitlerjs/nexus-client-ws';

import { useNexus } from '../provider/provider.js';
import { useHasEntity } from '../entities/entities.js';

type MutationType<T extends ServerDefinition, TKey extends keyof T['entities']> = typeof useMutation<
  Record<string, never>,
  unknown,
  T['entities'][TKey]['update']
>;

const useUpdateEntityMutation = <T extends ServerDefinition, TKey extends keyof T['entities']>({
  kind,
  ...options
}: MutationOptions<Record<string, never>, unknown, T['entities'][TKey]['update'], unknown> & {
  kind: TKey;
}): ReturnType<MutationType<T, TKey>> & { available: boolean } => {
  const { client, queryClient } = useNexus<T>();
  const hasTask = useHasEntity(kind as string);
  const result = useMutation(
    {
      ...options,
      mutationFn: async (input) => {
        await client?.entities.update(kind, input);
        return {};
      },
    },
    queryClient,
  );

  return {
    ...result,
    available: hasTask,
  };
};

const createUpdateEntityMutationHooks = <T extends ServerDefinition>() => {
  const typesUseTaskMutation = <TKey extends keyof T['entities']>(
    ...args: Parameters<typeof useUpdateEntityMutation<T, TKey>>
  ) => useUpdateEntityMutation(...args);

  return {
    useUpdateEntityMutation: typesUseTaskMutation,
  };
};

export { useUpdateEntityMutation, createUpdateEntityMutationHooks };
