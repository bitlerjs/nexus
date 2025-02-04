import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from '@heroui/react';
import { useConversation } from '@bitlerjs/nexus-react-ws';
import { useCallback, useEffect, useState } from 'react';

const SystemPrompt = () => {
  const disclosure = useDisclosure();
  const { agentConfig, setAgentConfig } = useConversation();
  const [systemPrompt, setSystemPrompt] = useState(agentConfig.systemPrompt);

  const saveSystemPrompt = useCallback(() => {
    try {
      setAgentConfig((current) => ({
        ...current,
        systemPrompt: systemPrompt || undefined,
      }));
      disclosure.onClose();
    } catch (error) {
      console.error(error);
    }
  }, [setAgentConfig, systemPrompt]);

  useEffect(() => {
    setSystemPrompt(agentConfig.systemPrompt);
  }, [agentConfig.systemPrompt]);

  return (
    <>
      <Button variant="flat" size="sm" onPress={disclosure.onOpen}>
        System Prompt
      </Button>
      <Modal size="2xl" {...disclosure}>
        <ModalContent>
          <ModalHeader>System Prompt</ModalHeader>
          <ModalBody>
            <Textarea
              placeholder="Type your system prompt..."
              minRows={1}
              value={systemPrompt || ''}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button onPress={saveSystemPrompt} color="primary">
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export { SystemPrompt };
