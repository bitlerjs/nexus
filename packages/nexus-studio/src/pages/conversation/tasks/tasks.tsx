import { useConversation, useTasks } from '@bitlerjs/nexus-react-ws';
import {
  Input,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ScrollShadow,
  UseDisclosureProps,
} from '@heroui/react';
import Fuse from 'fuse.js';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

type SelectTasksProps = UseDisclosureProps;

const SelectTasks = (state: SelectTasksProps) => {
  const { tasks } = useTasks();
  const sortedTasks = useMemo(() => [...tasks].sort((a, b) => a.name.localeCompare(b.name)), [tasks]);
  const { agentConfig, setAgentConfig } = useConversation();
  const [searchValue, setSearchValue] = useState('');
  const searcher = useMemo(
    () =>
      new Fuse(tasks, {
        keys: ['kind', 'name', 'description'],
      }),
    [tasks],
  );
  const searchResults = useMemo(
    () => (searchValue ? searcher.search(searchValue).map((a) => a.item) : sortedTasks),
    [searchValue, searcher, sortedTasks],
  );
  return (
    <Modal {...state} onChange={undefined}>
      <ModalContent>
        <ModalHeader>Select tasks</ModalHeader>
        <ModalBody>
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search tasks"
            startContent={<Search />}
          />
          <ScrollShadow className="max-h-[60vh]">
            <Listbox
              items={searchResults}
              selectedKeys={agentConfig.tasks || []}
              selectionMode="multiple"
              onSelectionChange={(selectedKeys) => {
                setAgentConfig((prev) => ({ ...prev, tasks: Array.from(selectedKeys).map(String) }));
              }}
            >
              {(task) => (
                <ListboxItem key={task.kind} value={task.kind} title={task.name} description={task.description} />
              )}
            </Listbox>
          </ScrollShadow>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { SelectTasks };
