import { useNexus } from '../exports.js';

import { useEventEffect, useTaskMutation, useTaskQuery } from './configs.typed-hooks.js';

const useConfigs = () => {
  const value = useTaskQuery({
    kind: 'configs.list',
    input: {},
    queryKey: ['configs.list'],
  });

  const remove = useTaskMutation({
    kind: 'configs.remove-value',
  });

  useEventEffect({
    kind: 'configs.types-updated',
    input: {},
    handler: () => {
      value.refetch();
    },
  });

  return {
    ...value,
    configs: value.data?.result || [],
    remove,
  };
};

const useConfig = (kind: string) => {
  const { queryClient } = useNexus();
  const result = useTaskQuery({
    kind: 'configs.describe',
    input: { kind },
    queryKey: ['configs.describe', kind],
  });
  const value = useTaskQuery({
    kind: 'configs.get-value',
    input: { kind },

    queryKey: ['configs.get', kind],
  });

  const update = useTaskMutation({
    kind: 'configs.set-value',
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ['configs.get', kind],
      });
      console.log('value refetched');
    },
  });

  return {
    ...result,
    config: result.data?.result,
    current: value.data?.result,
    value,
    update,
  };
};

export { useConfigs, useConfig };
