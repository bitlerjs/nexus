import { Button, Card, CardBody, Input, ScrollShadow } from '@heroui/react';
import { useTodos } from '../hooks/todos.js';
import { Todo } from './todos.item.js';
import { useCallback, useState } from 'react';
import { BotMessageSquareIcon, PlusIcon, SendIcon } from 'lucide-react';
import { useAgent } from '../hooks/agent.js';

const Todos = () => {
  const { todos, create, isCreating } = useTodos();
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const { ask, isPending, data } = useAgent();

  const createTodo = useCallback(() => {
    create(
      {
        input: {
          title,
        },
      },
      {
        onSuccess: () => {
          setTitle('');
        },
      },
    );
  }, [create, title]);

  const askQuestion = useCallback(() => {
    ask(question);
  }, [ask, question]);

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-8 gap-4">
      <h1 className="text-2xl font-bold">Awesome Todo</h1>
      <div className="flex gap-2">
        <Input className="flex-1" value={title} onValueChange={setTitle} placeholder="Add a todo" />
        <Button
          isIconOnly
          onPress={createTodo}
          isDisabled={isCreating || !title}
          color="primary"
          isLoading={isCreating}
        >
          <PlusIcon />
        </Button>
      </div>
      <div className="flex-1 overflow-y-hidden">
        <ScrollShadow className="h-full p-6">
          <div className="flex flex-col gap-2">
            {todos.map((todo) => (
              <Todo key={todo.id} todo={todo} />
            ))}
          </div>
        </ScrollShadow>
      </div>
      <div className="flex flex-col gap-4">
        {data && (
          <div className="flex gap-3 items-center">
            <BotMessageSquareIcon />
            <Card>
              <CardBody>
                <div>{String(data.result.content)}</div>
              </CardBody>
            </Card>
          </div>
        )}
        <div className="flex gap-2">
          <Input className="flex-1" value={question} onValueChange={setQuestion} placeholder="Ask me to help!" />
          <Button
            isIconOnly
            onPress={askQuestion}
            isDisabled={isPending || !question}
            color="primary"
            isLoading={isPending}
          >
            <SendIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export { Todos };
