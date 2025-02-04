import { useCallback } from 'react';

import { useTaskMutation } from './nexus.js';

const useAgent = () => {
  const agent = useTaskMutation({
    kind: 'llm.completion',
  });

  const ask = useCallback(
    (prompt: string) => {
      agent.mutate({
        input: {
          prompt,
          tasks: ['todo.create', 'todo.update', 'todo.delete', 'todo.list'],
        },
      });
    },
    [agent.mutate],
  );

  return {
    ...agent,
    ask,
  };
};

export { useAgent };
