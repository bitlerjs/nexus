import { type ServerDefinition } from '@bitlerjs/nexus-client-ws';
import { createTypedHooks, useTaskMutation } from '../client/client.js';
import { useNexus } from '../provider/provider.js';
import { useQuery } from '@tanstack/react-query';
import React, { createContext } from 'react';

const { useEventEffect } = createTypedHooks<ServerDefinition>();

const useCreateTasks = () => {
  const { client, queryClient } = useNexus();
  const result = useQuery(
    {
      queryKey: ['tasks.list'],
      queryFn: () => {
        return client?.tasks.list() || [];
      },
      enabled: !!client,
    },
    queryClient,
  );

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
    ...result,
    tasks: result.data || [],
  };
};

type TasksContextValue = ReturnType<typeof useCreateTasks>;

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

type TasksProviderProps = {
  children: React.ReactNode;
};

const TasksProvider = ({ children }: TasksProviderProps) => {
  const value = useCreateTasks();
  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

const useTasks = () => {
  const context = React.useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
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

export { useTasks, useTask, useHasTask, TasksProvider };
