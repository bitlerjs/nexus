import { ConversationProvider, useCreateConversation } from '@bitlerjs/nexus-react-ws';
import { Page } from '../../components/layout/page';
import { Button, ButtonGroup, Textarea, useDisclosure } from '@heroui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { SelectTasks } from './tasks/tasks';
import { useScreen } from '../../features/screens/screens';
import { Message } from './message/message';
import { Continuation } from '../../components/continuation/continuation';
import { Schema } from './schema/schema';
import { SystemPrompt } from './system-prompt/system-prompt';
import { Model } from './models/models';
import { useAddToast } from '../../features/toasts/toasts.hooks';

const getConversationFromLocalStorage = (id: string) => {
  const conversation = localStorage.getItem(`nexus-studio:conversation-${id}`);
  return conversation ? JSON.parse(conversation) : undefined;
};

const Converstation = () => {
  const { id } = useScreen();
  const addToast = useAddToast();
  const containerRef = useRef<HTMLElement>(null);
  const conversation = useCreateConversation(getConversationFromLocalStorage(id));
  const [input, setInput] = useState('');
  const tasksDisclosure = useDisclosure();

  const prompt = useCallback(() => {
    if (!input) return;
    conversation.prompt(
      { input: { prompt: input } },
      {
        onSuccess: () => {
          setInput('');
          requestAnimationFrame(() => {
            containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
          });
        },
        onError: (error) => {
          addToast({
            title: 'Error',
            type: 'error',
            description: error instanceof Error ? error.message : 'An error occurred',
            timeout: 3000,
          });
        },
      },
    );
    requestAnimationFrame(() => {
      containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, [input]);

  useEffect(() => {
    requestAnimationFrame(() => {
      containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, [conversation.dialog]);

  useEffect(() => {
    localStorage.setItem(
      `nexus-studio:conversation-${id}`,
      JSON.stringify({
        dialog: conversation.dialog,
        agentConfig: conversation.agentConfig,
      }),
    );
  }, [conversation.dialog, conversation.agentConfig, id]);

  return (
    <ConversationProvider {...conversation}>
      <SelectTasks {...tasksDisclosure} />
      <Page
        sidebar={
          Object.keys(conversation.currentContinuation).length > 0 && (
            <div className="p-4">
              <h2 className="text-lg font-bold">Current Context</h2>
              <Continuation continuation={conversation.currentContinuation} />
            </div>
          )
        }
      >
        <Page.Body ref={containerRef}>
          <Page.Content>
            <div className="flex flex-col gap-8">
              {conversation.dialog.map((message) => (
                <Message key={message.id} message={message} />
              ))}
            </div>
          </Page.Content>
        </Page.Body>
        <Page.Footer className="py-4">
          <Page.Content className="flex flex-col gap-2">
            <ButtonGroup>
              <Model />
              <Button variant="flat" size="sm" onPress={tasksDisclosure.onOpen}>
                Tasks
              </Button>
              <Schema />
              <SystemPrompt />
            </ButtonGroup>
            <div className="flex gap-2">
              <Textarea
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && input) {
                    e.preventDefault();
                    prompt();
                  }
                }}
                placeholder="Type a message..."
                isDisabled={conversation.isPending}
                minRows={1}
                className="flex-1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button
                isDisabled={!input || conversation.isPending}
                isLoading={conversation.isPending}
                isIconOnly
                color="primary"
                onPress={prompt}
                title="Send"
              >
                <Send />
              </Button>
            </div>
          </Page.Content>
        </Page.Footer>
      </Page>
    </ConversationProvider>
  );
};

export { Converstation };
