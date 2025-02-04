import { type ServerDefinition } from '@bitlerjs/nexus-client-ws';
import { createTypedHooks, useTaskMutation } from '../client/client.js';
import { useNexus } from '../provider/provider.js';
import { useQuery } from '@tanstack/react-query';

const { useEventEffect } = createTypedHooks<ServerDefinition>();

const useTasks = () => {
  const { client, queryClient } = useNexus();
  const { data, isLoading } = useQuery(
    {
      queryKey: ['tasks.list'],
      queryFn: () => client?.tasks.list() || [],
    },
    queryClient,
  );

  // useEventEffect({
  //   kind: 'tasks.updated',
  //   input: {},
  //   handler: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ['tasks.list'],
  //     });
  //   },
  // });

  return {
    isLoading,
    tasks: data || [],
  };
};

const useHasTask = (kind: string) => {
  const { tasks } = useTasks();
  return !!tasks.find((c) => c.kind === kind);
};

const useTask = (kind: string) => {
  const { client, queryClient } = useNexus();
  const { data, ...rest } = useQuery({
    queryKey: ['tasks.describe', kind],
    queryFn: () => client?.tasks.describe(kind),
  });

  const run = useTaskMutation({
    kind,
  });

  useEventEffect({
    kind: 'tasks.updated',
    input: {},
    handler: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks.list'],
      });
    },
  });

  return {
    ...rest,
    task: data,
    run: run,
  };
};

export { useTasks, useTask, useHasTask };
