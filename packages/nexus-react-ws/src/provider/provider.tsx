import { Client, type ServerDefinition } from '@bitlerjs/nexus-client-ws';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TasksProvider } from '../exports.js';
import { EventsProvider } from '../events/events.js';

type LoginOptions = {
  url: string;
  token: string;
};

type LoginState = 'pending' | 'not-logged-in' | 'logging-in' | 'logged-in';

type NexusOptions = {
  getSession?: () => Promise<LoginOptions | undefined>;
  setSession?: (session?: LoginOptions) => Promise<void>;
};

const useCreateNexus = <T extends ServerDefinition = ServerDefinition>({ getSession, setSession }: NexusOptions) => {
  const [state, setState] = useState<LoginState>('pending');
  const [client, setClient] = useState<Client<T>>();
  const [error, setError] = useState<unknown>();
  const queryClient = useMemo(() => new QueryClient(), [client]);

  const login = useCallback(async (options: LoginOptions) => {
    setState('logging-in');
    setError(undefined);
    try {
      const nextClient = new Client<T>({
        url: options.url,
        token: options.token,
      });
      setClient(nextClient);
      await setSession?.(options);
      setState('logged-in');
    } catch (err) {
      setError(err);
      setState('not-logged-in');
    }
  }, []);

  const logout = useCallback(() => {
    setState('not-logged-in');
    setClient(undefined);
    setSession?.();
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        setError(undefined);
        const session = await getSession?.();
        if (session) {
          await login(session);
        } else {
          setState('not-logged-in');
        }
      } catch (err) {
        setError(err);
      }
    };
    run();
  }, []);

  return {
    state,
    error,
    client,
    login,
    logout,
    queryClient,
  };
};

type NexusContextValue<T extends ServerDefinition = ServerDefinition> = ReturnType<typeof useCreateNexus<T>>;

const NexusContext = createContext<NexusContextValue | undefined>(undefined);

type NexusProviderProps = NexusContextValue & {
  children: ReactNode;
};

const NexusProvider = ({ children, ...props }: NexusProviderProps) => {
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
