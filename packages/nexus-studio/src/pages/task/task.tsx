import { useTask } from '@bitlerjs/nexus-react-ws';

type TaskProps = {
  kind: string;
};

const Task = ({ kind }: TaskProps) => {
  const { task } = useTask(kind);
  return (
    <div>
      <h1>Task: {task?.name}</h1>
    </div>
  );
};

export { Task };
