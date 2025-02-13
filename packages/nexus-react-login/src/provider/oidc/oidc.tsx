import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { LoginProvider } from '@bitlerjs/nexus-react-ws';

type OIDCLoginOptions = {
  authority: string;
  clientId: string;
  onLogout?: () => void;
  error?: unknown;
};

const useCreateLogin = (options: OIDCLoginOptions) => {
  const userManager = useMemo(
    () =>
      new UserManager({
        authority: options.authority,
        client_id: options.clientId,
        redirect_uri: location.href,
        revokeTokenTypes: ['refresh_token'],
        scope: 'openid profile email offline_access',
        automaticSilentRenew: false,
        response_type: 'code',
        userStore: new WebStorageStateStore({ store: localStorage }),
      }),
    [],
  );
  const [state, setState] = useState<'pending' | 'logged-out' | 'logged-in'>('pending');
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await userManager.getUser();
        if (storedUser) {
          setUser(storedUser);
          setState('logged-in');
        } else {
          setState('logged-out');
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      }
    };

    loadUserFromStorage();

    userManager.events.addAccessTokenExpired(() => {
      console.log('Access token expired');
      userManager.signoutRedirect();
    });

    userManager.events.addUserLoaded(() => {
      setState('logged-in');
    });

    userManager.events.addUserUnloaded(() => {
      setState('logged-out');
      options.onLogout?.();
    });

    userManager.events.addSilentRenewError((error) => {
      console.error('Silent renew error', error);
    });

    userManager.events.addAccessTokenExpiring(() => {
      console.log('Access token expiring');
      userManager.signinSilent();
    });
  }, [userManager]);

  const login = useCallback(async () => {
    try {
      await userManager.signinRedirect();
    } catch (error) {
      console.error('Login error:', error);
    }
  }, [userManager]);

  const logout = useCallback(async () => {
    try {
      console.log('Logout');
      options.onLogout?.();
      await userManager.signoutRedirect();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [userManager]);

  useEffect(() => {
    if (state !== 'logged-out') {
      return;
    }
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.has('code')) {
      const run = async () => {
        const user = await userManager.signinCallback(location.href);
        setUser(user);
        setState('logged-in');
        const nextUrl = new URL(location.href);
        nextUrl.searchParams.delete('code');
        nextUrl.searchParams.delete('state');
        window.history.replaceState({}, '', nextUrl.toString());
      };
      run();
      return;
    }
    login();
  }, [state, login]);

  return {
    state,
    accessToken: user?.access_token,
    login,
    logout,
  };
};

type OIDCLoginProviderProps = OIDCLoginOptions & {
  url: string;
  children: React.ReactNode;
  loading?: React.ReactNode;
};

const OIDCLoginProvider = ({ children, url, loading, ...rest }: OIDCLoginProviderProps) => {
  const login = useCreateLogin(rest);

  if (login.state !== 'logged-in') {
    return loading || null;
  }

  return (
    <LoginProvider accessToken={login.accessToken} url={url} onLogout={login.logout}>
      {children}
    </LoginProvider>
  );
};

export { OIDCLoginProvider };
