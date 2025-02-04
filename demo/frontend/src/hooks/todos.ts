import { useEventEffect, useTaskMutation, useTaskQuery } from './nexus.js';

const useTodos = () => {
  const todos = useTaskQuery({
    kind: 'todo.list',
    input: {},
    queryKey: ['todo.list'],
  });

  useEventEffect({
    kind: 'todo.updated',
    input: {},
    handler: () => {
      todos.refetch();
    },
  });

  const create = useTaskMutation({
    kind: 'todo.create',
  });

  return {
    ...todos,
    todos: todos.data?.result || [],
    create: create.mutate,
    isCreating: create.isPending,
    createError: create.error,
  };
};

const useUpdateTodo = () => {
  const remove = useTaskMutation({
    kind: 'todo.delete',
  });
  const update = useTaskMutation({
    kind: 'todo.update',
  });

  return {
    isPending: remove.isPending || update.isPending,
    remove: remove.mutate,
    removeError: remove.error,
    update: update.mutate,
    updateError: update.error,
  };
};

export { useTodos, useUpdateTodo };
