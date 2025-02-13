import { Client, type ServerDefinition } from '@bitlerjs/nexus-client-ws';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TasksProvider } from '../tasks/tasks.js';
import { EventsProvider } from '../events/events.js';
import { useLogin } from '../login/login.js';

type LoginState = 'pending' | 'not-logged-in' | 'logging-in' | 'logged-in';

const useCreateNexus = <T extends ServerDefinition = ServerDefinition>() => {
  const { url, accessToken } = useLogin();
  const [state, setState] = useState<LoginState>('pending');
  const [client, setClient] = useState<Client<T>>();
  const [error, setError] = useState<unknown>();
  const queryClient = useMemo(() => new QueryClient(), [client]);

  const retry = useCallback(async () => {
    setState('logging-in');
    try {
      setError(undefined);
      const nextClient = new Client<T>({
        url,
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
      });
      await nextClient.ready();
      setClient(nextClient);
      setState('logged-in');
    } catch (err) {
      setError(err);
      setState('not-logged-in');
    }
  }, [url, accessToken]);

  useEffect(() => {
    retry();
  }, [retry]);

  return {
    state,
    error,
    client,
    queryClient,
  };
};

type NexusContextValue<T extends ServerDefinition = ServerDefinition> = ReturnType<typeof useCreateNexus<T>>;

const NexusContext = createContext<NexusContextValue | undefined>(undefined);

type NexusProviderProps = {
  children: ReactNode;
};

const NexusProvider = ({ children }: NexusProviderProps) => {
  const props = useCreateNexus();
  return (
    <QueryClientProvider client={props.queryClient}>
      <NexusContext.Provider value={props}>
        <EventsProvider>
          <TasksProvider>{children}</TasksProvider>
        </EventsProvider>
      </NexusContext.Provider>
    </QueryClientProvider>
  );
};

const useNexus = <T extends ServerDefinition = ServerDefinition>() => {
  const context = useContext(NexusContext);
  if (!context) {
    throw new Error('Missing login provider');
  }
  return context as NexusContextValue<T>;
};

const useIsConnected = () => {
  const { client } = useNexus();
  const [connected, setConnected] = useState(!!client?.connected);

  useEffect(() => {
    if (!client) {
      return;
    }
    setConnected(!!client.connected);
    const onConnect = () => {
      setConnected(true);
    };
    const onDisconnect = () => {
      setConnected(false);
    };
    client.addListener('connected', onConnect);
    client.addListener('disconnected', onDisconnect);

    return () => {
      client.removeListener('connected', onConnect);
      client.removeListener('disconnected', onDisconnect);
    };
  }, [client]);

  return connected;
};

export { NexusProvider, useNexus, useCreateNexus, useIsConnected };
