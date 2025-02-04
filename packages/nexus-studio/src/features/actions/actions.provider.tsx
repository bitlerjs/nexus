import { useCallback, useState } from 'react';
import { ActionsContext, ActionsContextValue, RegisterActionOptions } from './actions.context';

type ActionsProviderProps = {
  children: React.ReactNode;
};

const ActionsProvider = ({ children }: ActionsProviderProps) => {
  const [actions, setActions] = useState<ActionsContextValue['actions']>([]);

  const registerAction = useCallback((options: RegisterActionOptions) => {
    setActions((prevActions) => [...prevActions, options]);
    return () => {
      setActions((prevActions) => prevActions.filter((action) => action !== options));
    };
  }, []);

  return <ActionsContext.Provider value={{ actions, registerAction }}>{children}</ActionsContext.Provider>;
};

export { ActionsProvider };
