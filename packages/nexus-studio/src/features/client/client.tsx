import { NexusClient } from '@bitlerjs/nexus-client';
import React, { useMemo, createContext, useContext, useState, useEffect, useCallback } from 'react';

type Session = {
  url: string;
};

type UseCreateClientOptions = {
  getSession: () => Promise<Session>;
  setSession: (session?: Session) => void;
};

const useCreateClient = (options: UseCreateClientOptions) => {
  const [error, setError] = useState<unknown>(undefined);
  const [loginState, setLoginState] = useState<'loading' | 'logged-out' | 'logged-in'>('loading');
  const [session, setSession] = useState<Session>();
  const client = useMemo(() => session && new NexusClient({ url: session.url }), [session]);

  useEffect(() => {
    setError(undefined);
    const run = async () => {
      try {
        const session = await options.getSession();
        setSession(session);
        if (session) {
          setLoginState('logged-in');
        } else {
          setLoginState('logged-out');
        }
      } catch (e) {
        setError(e);
        setLoginState('logged-out');
      }
    };
    run();
  }, [options.getSession]);

  const logout = useCallback(() => {
    setSession(undefined);
    setLoginState('logged-out');
    options.setSession(undefined);
  }, [options.setSession]);

  const login = useCallback(
    (url: string) => {
      setSession({ url });
      setLoginState('logged-in');
      options.setSession({ url });
    },
    [options.setSession],
  );

  return { client, error, loginState, logout, login };
};

type ClientContextValue = ReturnType<typeof useCreateClient>;

const ClientContext = createContext<ClientContextValue | undefined>(undefined);

const useClientContext = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClientContext must be used within a ClientProvider');
  }
  return context;
};

type ClientProviderProps = ClientContextValue & {
  children: React.ReactNode;
};

const ClientProvider = ({ children, ...props }: ClientProviderProps) => {
  return <ClientContext.Provider value={props}>{children}</ClientContext.Provider>;
};

export { useCreateClient, useClientContext, ClientProvider };
