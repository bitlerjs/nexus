import React, { createContext, ReactNode, useContext } from 'react';

type LoginContextType = {
  accessToken?: string;
  url: string;
  onLogout?: () => void;
};

const LoginContext = createContext<LoginContextType | undefined>(undefined);

const useLogin = () => {
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error('useLoginContext must be used within a LoginContextProvider');
  }
  return context;
};

type LoginProviderProps = LoginContextType & {
  children?: ReactNode;
};
const LoginProvider = ({ children, ...value }: LoginProviderProps) => {
  return <LoginContext.Provider value={value}>{children}</LoginContext.Provider>;
};

export { LoginProvider, useLogin };
