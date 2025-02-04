import { createContext, ReactNode, useContext } from 'react';

type ActionShortcutType = {
  shift?: boolean;
  control?: boolean;
  option?: boolean;
  key: string;
};

type ActionShortcut = {
  macos?: ActionShortcutType;
  windows?: ActionShortcutType;
  default: ActionShortcutType;
};

type RegisterActionOptions = {
  title: string;
  description?: string;
  icon?: ReactNode;
  view?: ReactNode;
  handler?: () => void;
  shortcut?: ActionShortcut;
};

type ActionsContextValue = {
  registerAction: (options: RegisterActionOptions) => () => void;
  actions: RegisterActionOptions[];
};

const ActionsContext = createContext<ActionsContextValue | undefined>(undefined);

const useActionsContext = () => {
  const context = useContext(ActionsContext);
  if (!context) {
    throw new Error('useActionsContext must be used within a ActionsProvider');
  }
  return context;
};

export { ActionsContext, useActionsContext, type ActionsContextValue, type RegisterActionOptions };
