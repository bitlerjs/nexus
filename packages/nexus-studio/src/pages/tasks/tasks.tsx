import { useTasks } from '@bitlerjs/nexus-react-ws';
import { Input, Listbox, ListboxItem } from '@heroui/react';
import { useAddScreen } from '../../features/screens/screens.hooks';
import { Page } from '../../components/layout/page';
import { Search } from 'lucide-react';

const Tasks = () => {
  const { tasks } = useTasks();
  const addScreen = useAddScreen();
  return (
    <Page>
      <Page.Header title="Tasks">
        <Page.Content>
          <Input placeholder="Search tasks" startContent={<Search />} />
        </Page.Content>
      </Page.Header>
      <Page.Body>
        <Page.Content>
          <Listbox>
            {tasks.map((task) => (
              <ListboxItem
                key={task.kind}
                title={task.name}
                description={task.description}
                onPress={() => {
                  addScreen({
                    kind: 'task',
                    title: `Task: ${task.name}`,
                    focus: true,
                    props: { kind: task.kind },
                  });
                }}
              />
            ))}
          </Listbox>
        </Page.Content>
      </Page.Body>
    </Page>
  );
};

export { Tasks };
