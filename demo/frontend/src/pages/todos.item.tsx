import { Button, Card, CardBody, Checkbox, Spinner } from '@heroui/react';
import { useTodos, useUpdateTodo } from '../hooks/todos';
import { useCallback } from 'react';
import { TrashIcon } from 'lucide-react';

type TodoProps = {
  todo: ReturnType<typeof useTodos>['todos'][0];
};
const Todo = ({ todo }: TodoProps) => {
  const { update, remove, isPending } = useUpdateTodo();

  const toggle = useCallback(
    (state: boolean) => {
      update({
        input: {
          id: todo.id,
          completedAt: state ? new Date().toISOString() : null,
        },
      });
    },
    [todo.id, update],
  );

  const removeItem = useCallback(() => {
    remove({
      input: {
        ids: [todo.id],
      },
    });
  }, [remove, todo.id]);

  return (
    <Card>
      <CardBody>
        <div className="flex gap-2 items-center">
          <div>
            <Checkbox isSelected={!!todo.completedAt} onValueChange={toggle} />
          </div>
          <div className="flex-1">
            <div>{todo.title}</div>
            {todo.description && <div className="text-sm text-gray-500">{todo.description}</div>}
          </div>
          <div>
            {isPending && <Spinner size="sm" />}
            <Button variant="light" size="sm" isIconOnly onPress={removeItem} isDisabled={isPending} color="danger">
              <TrashIcon size={16} />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export { Todo };
