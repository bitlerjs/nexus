import { useTaskQuery } from './conversation.typed-hooks.js';

const useModels = () => {
  const result = useTaskQuery({
    kind: 'llm.list-models',
    input: {},
    queryKey: ['models.list'],
  });
  return result;
};

export { useModels };
