import { useConversation } from '@bitlerjs/nexus-react-ws';
import {
  Button,
  ButtonGroup,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ScrollShadow,
  Tooltip,
  useDisclosure,
  User,
} from '@heroui/react';
import { formatRelative } from 'date-fns';
import { Bot, RefreshCw, Trash, User2, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Continuation } from '../../../components/continuation/continuation';

type HeaderProps = {
  message: Exclude<ReturnType<typeof useConversation>['dialog'], undefined>[0];
};

type UserHeaderProps = {
  message: HeaderProps['message'];
};
const UserHeader = ({ message }: UserHeaderProps) => {
  const [date, setDate] = useState(new Date());
  const formattedDate = useMemo(() => {
    return formatRelative(message.timestamp || 0, new Date());
  }, [date]);
  const user = useMemo(() => {
    switch (message.role) {
      case 'user':
        return { name: 'You', icon: <User2 size={18} /> };
      case 'assistant':
        return { name: 'Bot', icon: <Bot size={18} /> };
      default:
        return { name: 'Unknown', icon: <User2 size={18} /> };
    }
  }, [message.role]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <User
      key={message.id}
      avatarProps={{
        size: 'sm',
        icon: user.icon,
      }}
      name={user.name}
      description={formattedDate}
    />
  );
};

const Header = ({ message }: HeaderProps) => {
  const toolsDisclosure = useDisclosure();
  const continuationDisclosure = useDisclosure();
  const conversation = useConversation();
  const [selectedTool, setSelectedTool] = useState<number>();
  const toolsWithNumbers = useMemo(
    () =>
      message.toolsUsed?.map((tool, i) => ({
        ...tool,
        number: i,
      })),
    [message.toolsUsed],
  );
  const selectedToolData = useMemo(
    () => toolsWithNumbers?.find((tool) => tool.number === selectedTool),
    [selectedTool, toolsWithNumbers],
  );
  return (
    <div className="flex items-center px-4">
      <div className="flex-1">
        <UserHeader message={message} />
      </div>
      <ButtonGroup>
        {message.role === 'user' && (
          <Tooltip content="Rerun">
            <Button size="sm" variant="flat" isIconOnly onPress={() => conversation.rerun(message.id)}>
              <RefreshCw size={18} />
            </Button>
          </Tooltip>
        )}
        {toolsWithNumbers && toolsWithNumbers.length > 0 && (
          <>
            <Tooltip content="Tools used">
              <Button size="sm" variant="flat" isIconOnly onPress={toolsDisclosure.onOpen}>
                <Wrench size={18} />
              </Button>
            </Tooltip>
            <Modal size="4xl" {...toolsDisclosure}>
              <ModalContent>
                <ModalHeader>Tools used</ModalHeader>
                <ModalBody className="flex">
                  <div className="flex">
                    <div className="flex-1">
                      <ScrollShadow className="max-h-[80vh]">
                        <Listbox
                          items={toolsWithNumbers}
                          selectionMode="single"
                          selectedKeys={selectedTool !== undefined ? [selectedTool] : []}
                          onSelectionChange={(selected) => {
                            const [key] = Array.from(selected);
                            setSelectedTool(Number(key));
                          }}
                        >
                          {(item) => <ListboxItem key={item.number} title={item.kind} />}
                        </Listbox>
                      </ScrollShadow>
                    </div>
                    {selectedToolData && (
                      <ScrollShadow className="max-h-[80vh]">
                        <div className="flex-1">
                          <h2>Kind</h2>
                          <div>{selectedToolData.kind}</div>
                          <h2>Input</h2>
                          <pre>
                            <code>{JSON.stringify(selectedToolData.input, null, 2)}</code>
                          </pre>
                          <h2>Output</h2>
                          <pre>
                            <code>{JSON.stringify(selectedToolData.output, null, 2)}</code>
                          </pre>
                          {selectedToolData.error && (
                            <>
                              <h2>Error</h2>
                              <pre>
                                <code>{selectedToolData.error}</code>
                              </pre>
                            </>
                          )}
                        </div>
                      </ScrollShadow>
                    )}
                  </div>
                </ModalBody>
              </ModalContent>
            </Modal>
          </>
        )}
        <Tooltip content="Delete message">
          <Button
            size="sm"
            variant="flat"
            onClick={() => {
              conversation.removeDialogItem(message.id);
            }}
            isIconOnly
          >
            <Trash size={18} />
          </Button>
        </Tooltip>
        {Object.keys(message.contiuations).length > 0 && (
          <Tooltip content="View continuation context">
            <Button size="sm" variant="flat" onClick={continuationDisclosure.onOpen} disabled={!message.contiuations}>
              Context
            </Button>
          </Tooltip>
        )}
        <Modal {...continuationDisclosure}>
          <ModalContent>
            <ModalHeader>Modal</ModalHeader>
            <ModalBody>
              <Continuation continuation={message.contiuations} />
            </ModalBody>
          </ModalContent>
        </Modal>
      </ButtonGroup>
    </div>
  );
};

export { Header };
