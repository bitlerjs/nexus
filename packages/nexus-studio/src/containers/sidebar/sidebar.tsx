import { Button, Divider, Listbox, ListboxItem, ListboxSection } from '@heroui/react';
import { Bot, BotMessageSquare, LaptopMinimalCheck, Moon, PlayCircle, PlusCircle, Sun } from 'lucide-react';
import { useAddScreen } from '../../features/screens/screens';
import { useTheme } from 'next-themes';

const Sidebar = () => {
  const { theme, setTheme } = useTheme();
  const addScreen = useAddScreen();
  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 flex flex-col py-4">
        <div className="flex items-center gap-2 px-2 pb-8">
          <Bot size={40} className="stroke-default-500 rotate-12" />
          <div>
            <div className="text-4xl font-bold">Nexus</div>
            <div className="text-xs text-default-500">Everything is an agent</div>
          </div>
        </div>
        <Divider />
        <Listbox>
          <ListboxSection title="Tools">
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
          </ListboxSection>
        </Listbox>
        <Divider />
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
