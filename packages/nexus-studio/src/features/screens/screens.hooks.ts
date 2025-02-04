import { useCallback, useContext } from 'react';

import { useScreensContext } from './screens.context.js';
import { ScreenContext } from './screens.screen.js';

const useAddScreen = () => {
  const { addScreen } = useScreensContext();
  return addScreen;
};

const useScreen = () => {
  const context = useContext(ScreenContext);
  const { setScreenTitle: orgSetTitle } = useScreensContext();
  if (!context) {
    throw new Error('useScreen must be used within a ScreenProvider');
  }

  const setScreenTitle = useCallback(
    (title: string) => {
      orgSetTitle(context.id, title);
    },
    [context.id, orgSetTitle],
  );

  return {
    ...context,
    setScreenTitle,
  };
};

export { useAddScreen, useScreen };
