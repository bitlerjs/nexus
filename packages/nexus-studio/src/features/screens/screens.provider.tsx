import { ReactNode, useCallback, useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import {
  AddScreenOptions,
  ScreenDefinition,
  Screens,
  ScreensContext,
  ScreensContextType,
  screens as screenList,
} from './screens.context';

type ScreensProviderProps = {
  children: ReactNode;
};

const SCREEN_STORE_KEY = 'nexus-studio:screens';
const SELECTED_STORE_KEY = 'nexus-studio:active-screen';

const getFromLocalStorage = () => {
  const screens = localStorage.getItem(SCREEN_STORE_KEY);
  return screens ? JSON.parse(screens) : {};
};

const getSelectedFromLocalStorage = () => {
  const screens = localStorage.getItem(SELECTED_STORE_KEY);
  return screens ? JSON.parse(screens) : {};
};

const ScreensProvider = ({ children }: ScreensProviderProps) => {
  const [screens, setScreens] = useState<ScreensContextType['screens']>(getFromLocalStorage());
  const [activeScreenId, setActiveScreenId] = useState<string>(getSelectedFromLocalStorage());
  const addScreen = useCallback(<TKind extends keyof Screens>(options: AddScreenOptions<TKind>) => {
    const id = options.id ?? nanoid();
    setScreens((screens) => ({
      ...screens,
      [id]: {
        title: options.title,
        kind: options.kind,
        props: options.props as any,
      },
    }));
    if (options.focus) {
      setActiveScreenId(id);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SCREEN_STORE_KEY, JSON.stringify(screens));
  }, [screens]);

  useEffect(() => {
    localStorage.setItem(SELECTED_STORE_KEY, JSON.stringify(activeScreenId));
  }, [activeScreenId]);

  const removeScreen = useCallback((id: string) => {
    setScreens((screens) => {
      const current = screens[id];
      if (!current) {
        return screens;
      }
      const onRemove = (screenList[current.kind] as ScreenDefinition)?.onRemove;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...rest } = screens;
      onRemove?.(id);
      return rest;
    });
  }, []);

  const setScreenTitle = useCallback((id: string, title: string) => {
    setScreens((screens) => ({
      ...screens,
      [id]: {
        ...screens[id],
        title,
      },
    }));
  }, []);

  return (
    <ScreensContext.Provider
      value={{
        screens,
        activeScreenId,
        setActiveScreenId,
        setScreenTitle,
        addScreen,
        removeScreen,
      }}
    >
      {children}
    </ScreensContext.Provider>
  );
};

export { ScreensProvider };
