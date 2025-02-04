import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
  useDisclosure,
} from '@heroui/react';
import { Editor } from '../../../components/editor/editor';
import { useConversation } from '@bitlerjs/nexus-react-ws';
import { useCallback, useEffect, useState } from 'react';

const Schema = () => {
  const schemaDisclosure = useDisclosure();
  const { agentConfig, setAgentConfig } = useConversation();
  const [schema, setSchema] = useState(agentConfig.schema ? JSON.stringify(agentConfig.schema, null, 2) : undefined);

  const saveSchema = useCallback(() => {
    try {
      setAgentConfig((current) => ({
        ...current,
        schema: schema ? JSON.parse(schema) : undefined,
      }));
      schemaDisclosure.onClose();
    } catch (error) {
      console.error(error);
    }
  }, [setAgentConfig, schema]);

  useEffect(() => {
    setSchema(agentConfig.schema ? JSON.stringify(agentConfig.schema, null, 2) : undefined);
  }, [agentConfig.schema]);

  return (
    <>
      <Button variant="flat" size="sm" onPress={schemaDisclosure.onOpen}>
        Schema
      </Button>
      <Modal size="5xl" className="h-[80vh]" {...schemaDisclosure}>
        <ModalContent>
          <ModalHeader>JSON Schema</ModalHeader>
          <ModalBody>
            <Editor value={schema || ''} onChange={setSchema} />
          </ModalBody>
          <ModalFooter>
            <Button onPress={saveSchema} color="primary">
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export { Schema };
