import { createContext } from 'react';

type ScreenContextValue = {
  isActive: boolean;
  id: string;
};

const ScreenContext = createContext<ScreenContextValue | undefined>(undefined);

export { ScreenContext };
