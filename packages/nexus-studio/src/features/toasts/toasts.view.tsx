import { motion, AnimatePresence } from 'framer-motion';
import { useRemoveToast, useToasts } from './toasts.hooks';
import { Alert } from '@heroui/react';

type ToastType = ReturnType<typeof useToasts>[0]['type'];

const getColor = (type: ToastType) => {
  switch (type) {
    case 'error':
      return 'danger';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    default:
      return 'default';
  }
};
const ToastViev = () => {
  const toasts = useToasts();
  const removeToast = useRemoveToast();

  return (
    <div className="fixed right-0 top-0 p-4 flex flex-col gap-4">
      <AnimatePresence>
        {toasts.map((toast, i) => (
          <motion.div
            key={toast.id || i.toString()}
            initial={{ opacity: 0, y: -100, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, y: 0, height: 'auto', overflow: 'visible' }}
            exit={{ opacity: 0, y: -100, height: 0, overflow: 'hidden' }}
          >
            <Alert
              onClose={() => removeToast(toast)}
              onClick={() => removeToast(toast)}
              title={toast.title}
              color={getColor(toast.type)}
              variant="flat"
              description={toast.description || '...'}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export { ToastViev };
