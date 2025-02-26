import { useNexus } from '../provider/provider.js';
import { useQuery } from '@tanstack/react-query';
import React, { createContext } from 'react';

const useCreateEntities = () => {
  const { client, queryClient } = useNexus();
  const result = useQuery(
    {
      queryKey: ['entities.list'],
      queryFn: () => {
        return client?.entities.list() || [];
      },
      enabled: !!client,
    },
    queryClient,
  );

  return {
    ...result,
    entities: result.data || [],
  };
};

type EntitiesContextValue = ReturnType<typeof useCreateEntities>;

const EntitiesContext = createContext<EntitiesContextValue | undefined>(undefined);

type EntitiesProviderProps = {
  children: React.ReactNode;
};

const EntitiesProvider = ({ children }: EntitiesProviderProps) => {
  const value = useCreateEntities();
  return <EntitiesContext.Provider value={value}>{children}</EntitiesContext.Provider>;
};

const useEntities = () => {
  const context = React.useContext(EntitiesContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};

const useHasEntity = (kind: string) => {
  const { entities } = useEntities();
  return !!entities.find((c) => c.kind === kind);
};

const useEntity = (kind: string) => {
  const { client, queryClient } = useNexus();
  const { data, ...rest } = useQuery(
    {
      queryKey: ['tasks.describe', kind],
      queryFn: () => client?.tasks.describe(kind),
    },
    queryClient,
  );

  return {
    ...rest,
    entity: data,
  };
};

export { useEntities, useEntity, useHasEntity, EntitiesProvider };
