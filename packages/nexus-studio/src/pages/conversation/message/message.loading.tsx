import { Skeleton } from '@heroui/react';

const MessageLoading = () => {
  return (
    <div className="space-y-3 py-4">
      <Skeleton className="w-3/5 rounded-lg">
        <div className="h-3 w-3/5 rounded-lg bg-default-200" />
      </Skeleton>
      <Skeleton className="w-4/5 rounded-lg">
        <div className="h-3 w-4/5 rounded-lg bg-default-200" />
      </Skeleton>
      <Skeleton className="w-2/5 rounded-lg">
        <div className="h-3 w-2/5 rounded-lg bg-default-300" />
      </Skeleton>
    </div>
  );
};

export { MessageLoading };
