import { Button, Divider, Listbox, ListboxItem, ListboxSection } from '@heroui/react';
import {
  Bot,
  BotMessageSquare,
  Calendar,
  Cog,
  Database,
  IdCard,
  LaptopMinimalCheck,
  Moon,
  Sun,
  Workflow,
} from 'lucide-react';
import { useAddScreen } from '../../features/screens/screens';
import { useTheme } from 'next-themes';
import { useHasTask } from '@bitlerjs/nexus-react-ws';
import clsx from 'clsx';

const Sidebar = () => {
  const { theme, setTheme } = useTheme();
  const addScreen = useAddScreen();
  const hasConfigs = useHasTask('configs.list');
  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 flex flex-col py-4">
        <div className="flex items-center gap-2 px-2 pb-8">
          <Bot size={40} className="stroke-default-500 rotate-12" />
          <div>
            <div className="text-4xl font-bold">Nexus;</div>
            <div className="text-xs text-default-500">@bitlerjs</div>
          </div>
        </div>
        <Listbox>
          <ListboxSection>
            <ListboxItem
              title="New conversation"
              description="Create a new conversation"
              startContent={
                <div className="text-default-600">
                  <BotMessageSquare size={22} />
                </div>
              }
              onPress={() =>
                addScreen({
                  kind: 'conversation',
                  title: 'New conversation',
                  props: {},
                  focus: true,
                })
              }
            />
          </ListboxSection>
          <ListboxSection title="Tools">
            <ListboxItem
              title="Tasks"
              description="See available tasks"
              startContent={
                <div className="text-default-600">
                  <LaptopMinimalCheck size={22} />
                </div>
              }
              onPress={() =>
                addScreen({
                  kind: 'tasks',
                  id: 'tasks',
                  title: 'Tasks',
                  props: {
                    foo: 'string',
                  },
                  focus: true,
                })
              }
            />
            <ListboxItem
              title="Agents"
              description="See available tasks"
              startContent={
                <div className="text-default-600">
                  <Bot size={22} />
                </div>
              }
              onPress={() =>
                addScreen({
                  kind: 'tasks',
                  id: 'tasks',
                  title: 'Tasks',
                  props: {
                    foo: 'string',
                  },
                  focus: true,
                })
              }
            />
            <ListboxItem
              className={clsx(!hasConfigs && 'hidden')}
              title="Configs"
              description="Update configurations"
              startContent={
                <div className="text-default-600">
                  <Cog size={22} />
                </div>
              }
              onPress={() =>
                addScreen({
                  kind: 'configs',
                  id: 'configs',
                  title: 'Configs',
                  props: {},
                  focus: true,
                })
              }
            />
            <ListboxItem
              title="Entities"
              description="Find and manage entities"
              startContent={
                <div className="text-default-600">
                  <IdCard size={22} />
                </div>
              }
            />
            <ListboxItem
              title="Databases"
              description="Find and manage entities"
              startContent={
                <div className="text-default-600">
                  <Database size={22} />
                </div>
              }
            />
            <ListboxItem
              title="Events"
              description="Subscribe to events"
              startContent={
                <div className="text-default-600">
                  <Calendar size={22} />
                </div>
              }
            />
            <ListboxItem
              title="Workflows"
              description="Build and manage workflows"
              startContent={
                <div className="text-default-600">
                  <Workflow size={22} />
                </div>
              }
            />
          </ListboxSection>
        </Listbox>
        <div className="flex-1" />
        <div className="flex justify-center">
          <Button isIconOnly variant="light" size="sm" onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' && <Sun />}
            {theme !== 'dark' && <Moon />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export { Sidebar };
