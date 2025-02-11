import { useNexus } from '../provider/provider.js';
import { useQuery } from '@tanstack/react-query';
import React, { createContext } from 'react';

const useCreateEvents = () => {
  const { client, queryClient } = useNexus();
  const { data, isLoading } = useQuery(
    {
      queryKey: ['tasks.list'],
      queryFn: () => client?.events.list() || [],
    },
    queryClient,
  );

  return {
    isLoading,
    tasks: data || [],
  };
};

type EventsContextValue = ReturnType<typeof useCreateEvents>;

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

type TasksProviderProps = {
  children: React.ReactNode;
};

const EventsProvider = ({ children }: TasksProviderProps) => {
  const value = useCreateEvents();
  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};

const useEvents = () => {
  const context = React.useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within a EventsProvider');
  }
  return context;
};

const useHasEvent = (kind: string) => {
  const { tasks } = useEvents();
  return !!tasks.find((c) => c.kind === kind);
};

export { useEvents, useHasEvent, EventsProvider };
