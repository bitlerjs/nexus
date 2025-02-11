import { ComponentType, createContext, useContext } from 'react';

import { Tasks } from '../../pages/tasks/tasks.js';
import { Task } from '../../pages/task/task.js';
import { Converstation } from '../../pages/conversation/conversation.js';
import { Configs } from '../../pages/configs/configs.js';
import { Config } from '../../pages/config/config.js';

type ScreenDefinition = {
  onRemove?: (id: string) => void | Promise<void>;
  component: ComponentType<any>;
};

const screens = {
  tasks: {
    component: Tasks,
  },
  task: {
    component: Task,
  },
  conversation: {
    component: Converstation,
    onRemove: async (id: string) => { },
  },
  configs: {
    component: Configs,
  },
  config: {
    component: Config,
  },
} satisfies Record<string, ScreenDefinition>;

type Screens = typeof screens;

type AddScreenOptions<TKind extends keyof Screens> = {
  title: string;
  kind: TKind;
  props: Screens[TKind]['component'] extends ComponentType<infer TProps> ? TProps : Record<string, never>;
  id?: string;
  focus?: boolean;
};

type ScreensContextType = {
  screens: Record<
    string,
    {
      title: string;
      kind: keyof Screens;
      props: object;
    }
  >;
  activeScreenId?: string;
  setActiveScreenId: (id: string) => void;
  addScreen: <TKind extends keyof Screens>(options: AddScreenOptions<TKind>) => void;
  setScreenTitle: (id: string, title: string) => void;
  removeScreen: (id: string) => void;
};

const ScreensContext = createContext<ScreensContextType | undefined>(undefined);

const useScreensContext = () => {
  const context = useContext(ScreensContext);
  if (!context) {
    throw new Error('useScreensContext must be used within a ScreensProvider');
  }
  return context;
};

export {
  ScreensContext,
  screens,
  useScreensContext,
  type ScreensContextType,
  type AddScreenOptions,
  type Screens,
  type ScreenDefinition,
};
