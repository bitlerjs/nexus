import React, { ComponentType, useCallback, useEffect, useState } from 'react';
import { OIDCLoginProvider } from './oidc/oidc.js';
import { LoginProvider } from '@bitlerjs/nexus-react-ws';

type WebLoginProviderProps = {
  url: string;
  clientId?: string;
  loading?: React.ReactNode;
  error?: ComponentType<{ error: unknown; logout: () => void }>;
  children: React.ReactNode;
  onLogout?: () => void;
};

type ServerConfig = {
  oidc?: {
    issuerUrl: string;
    clientId?: string;
  };
};

const WebLoginProvider = ({ children, clientId, onLogout, loading, url, error: ErrorView }: WebLoginProviderProps) => {
  const [config, setConfig] = useState<ServerConfig | undefined>(undefined);
  const [error, setError] = useState<unknown | undefined>(undefined);

  const updateConfig = useCallback(async () => {
    try {
      const configUrl = new URL('api/config', url).toString();
      const response = await fetch(configUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch server config');
      }
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      setError(error);
    }
  }, [url]);

  useEffect(() => {
    updateConfig();
  }, [updateConfig]);

  const handleLogout = useCallback(() => {
    onLogout?.();
  }, [onLogout]);

  if (error) {
    return ErrorView ? <ErrorView logout={handleLogout} error={error} /> : null;
  }

  if (!config) {
    return loading || null;
  }

  if (config.oidc) {
    const clientIdToUse = config.oidc.clientId || clientId;
    if (!clientIdToUse) {
      if (!ErrorView) {
        throw new Error('Missing client ID');
      }
      return <ErrorView logout={handleLogout} error={new Error('Missing client ID')} />;
    }
    return (
      <OIDCLoginProvider
        loading={loading}
        url={url}
        clientId={clientIdToUse}
        authority={config.oidc.issuerUrl}
        onLogout={onLogout}
      >
        {children}
      </OIDCLoginProvider>
    );
  } else {
    return (
      <LoginProvider url={url} onLogout={handleLogout}>
        {children}
      </LoginProvider>
    );
  }
};

export { WebLoginProvider };
