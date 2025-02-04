import React, { useRef } from 'react';
import { ToastsContext, ToastStore } from './toasts.context';
import { ToastViev } from './toasts.view';

type ToastsProviderProps = {
  children: React.ReactNode;
};

const ToastsProvider = ({ children }: ToastsProviderProps) => {
  const store = useRef(new ToastStore());
  return (
    <ToastsContext.Provider value={{ store: store.current }}>
      {children}
      <ToastViev />
    </ToastsContext.Provider>
  );
};

export { ToastsProvider };
