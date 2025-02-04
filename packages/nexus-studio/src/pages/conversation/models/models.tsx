import { useConversation, useModels } from '@bitlerjs/nexus-react-ws';
import {
  Button,
  Input,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';

const Model = () => {
  const { data } = useModels();
  const { agentConfig, setAgentConfig } = useConversation();
  const [searchValue, setSearchValue] = useState('');
  const searcher = useMemo(
    () =>
      new Fuse(data?.result || [], {
        keys: ['kind', 'name', 'provider'],
      }),
    [data],
  );
  const searchResults = useMemo(
    () => (searchValue ? searcher.search(searchValue).map((a) => a.item) : data?.result),
    [searchValue, searcher, data?.result],
  );
  const state = useDisclosure();
  return (
    <>
      <Button variant="flat" onPress={state.onOpen} size="sm">
        Model
      </Button>
      <Modal {...state} onChange={undefined}>
        <ModalContent>
          <ModalHeader>Select model</ModalHeader>
          <ModalBody>
            <Listbox
              items={searchResults || []}
              topContent={
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search tasks"
                  startContent={<Search />}
                />
              }
              selectedKeys={agentConfig.model ? [agentConfig.model] : []}
              selectionMode="single"
              onSelectionChange={(selectedKey) => {
                const [key] = Array.from(selectedKey);
                setAgentConfig((prev) => ({ ...prev, model: String(key) }));
                state.onClose?.();
              }}
            >
              {(model) => (
                <ListboxItem
                  key={model.kind}
                  value={model.kind}
                  title={model.name}
                  description={model.provider}
                ></ListboxItem>
              )}
            </Listbox>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export { Model };
