import { useMutation, type MutationOptions } from '@tanstack/react-query';
import { type ServerDefinition } from '@bitlerjs/nexus-client-ws';

import { useNexus } from '../provider/provider.js';
import { useHasTask } from '../exports.js';

import { TaskResponse, TaskInput } from './client.types.js';

type MutationType<T extends ServerDefinition, TKey extends keyof T['tasks']> = typeof useMutation<
  TaskResponse<T['tasks'][TKey]['output']>,
  unknown,
  TaskInput<T['tasks'][TKey]['input']>
>;

const useTaskMutation = <T extends ServerDefinition, TKey extends keyof T['tasks']>({
  kind,
  ...options
}: MutationOptions<TaskResponse<T['tasks'][TKey]['output']>, unknown, TaskInput<T['tasks'][TKey]['input']>, unknown> & {
  kind: TKey;
}): ReturnType<MutationType<T, TKey>> & { available: boolean } => {
  const { client, queryClient } = useNexus<T>();
  const hasTask = useHasTask(kind as string);
  const result = useMutation(
    {
      ...options,
      mutationFn: async ({ input, continuation }) => {
        const result = await client?.tasks.run(kind, input, continuation);
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

const createMutationHooks = <T extends ServerDefinition>() => {
  const typesUseTaskMutation = <TKey extends keyof T['tasks']>(...args: Parameters<typeof useTaskMutation<T, TKey>>) =>
    useTaskMutation(...args);

  return {
    useTaskMutation: typesUseTaskMutation,
  };
};

export { useTaskMutation, createMutationHooks };
