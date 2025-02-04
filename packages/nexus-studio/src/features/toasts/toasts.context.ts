import { EventEmitter } from 'eventemitter3';
import { createContext } from 'react';

type ToastAction = {
  label: string;
  onClick: () => void;
};

type Toast = {
  id?: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  actions?: ToastAction[];
  timeout?: number;
};

type ToastStoreEvents = {
  updated: () => void;
};

class ToastStore extends EventEmitter<ToastStoreEvents> {
  #toasts: Toast[] = [];

  public get toasts() {
    return [...this.#toasts];
  }

  addToast(toast: Toast) {
    this.#toasts.push(toast);
    if (toast.timeout) {
      setTimeout(() => {
        this.removeToast(toast);
      }, toast.timeout);
    }
    this.emit('updated');
  }

  removeToast(toast: Toast) {
    this.#toasts = this.#toasts.filter((t) => t !== toast);
    this.emit('updated');
  }
}

type ToastsContextValue = {
  store: ToastStore;
};

const ToastsContext = createContext<ToastsContextValue | undefined>(undefined);

export { ToastsContext, ToastStore, type Toast };
